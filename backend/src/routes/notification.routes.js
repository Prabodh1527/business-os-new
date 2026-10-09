import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Notification from "../models/notification.model.js";
import { getEmployeeIdentity, isEmployeeUser } from "../utils/employeeIdentity.js";

const router = express.Router();

router.use(protect, attachTenantDB);

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      filter.$and = [
        {
          $or: [
            {
              $and: [
                { $or: [{ recipientEmployeeId: "" }, { recipientEmployeeId: { $exists: false } }] },
                { $or: [{ recipientEmail: "" }, { recipientEmail: { $exists: false } }] },
              ],
            },
            ...(identity.employeeId ? [{ recipientEmployeeId: identity.employeeId }] : []),
            ...(identity.email ? [{ recipientEmail: identity.email }] : []),
          ],
        },
      ];
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const serialized = isEmployeeUser(req)
      ? notifications.map((notification) => {
          const item = notification.toObject();
          item.read = (item.readBy || []).includes(req.user._id.toString());
          return item;
        })
      : notifications;
    const unreadCount = isEmployeeUser(req)
      ? serialized.filter((notification) => !notification.read).length
      : await Notification.countDocuments({ ...filter, read: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: serialized,
      data: serialized,
    });
  } catch (error) {
    console.error("❌ Get Notifications Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notifications
router.post("/", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot publish notifications." });
    }
    const { title, message, type, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const notif = await Notification.create({
      tenantId: req.tenantId,
      title,
      message,
      type: type || "General",
      link: link || "",
      recipientEmployeeId: req.body.recipientEmployeeId || "",
      recipientEmail: req.body.recipientEmail?.toLowerCase() || "",
    });

    return res.status(201).json({ success: true, notification: notif, data: notif });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    let filter = { _id: req.params.id, tenantId: req.tenantId };
    let update = { $set: { read: true } };
    if (identity) {
      filter = {
        ...filter,
        $or: [
          {
            $and: [
              { $or: [{ recipientEmployeeId: "" }, { recipientEmployeeId: { $exists: false } }] },
              { $or: [{ recipientEmail: "" }, { recipientEmail: { $exists: false } }] },
            ],
          },
          ...(identity.employeeId ? [{ recipientEmployeeId: identity.employeeId }] : []),
          ...(identity.email ? [{ recipientEmail: identity.email }] : []),
        ],
      };
      update = { $addToSet: { readBy: req.user._id.toString() } };
    }
    const notif = await Notification.findOneAndUpdate(filter, update, { new: true });
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found." });
    return res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      const filter = {
        tenantId: req.tenantId,
        $or: [
          {
            $and: [
              { $or: [{ recipientEmployeeId: "" }, { recipientEmployeeId: { $exists: false } }] },
              { $or: [{ recipientEmail: "" }, { recipientEmail: { $exists: false } }] },
            ],
          },
          ...(identity.employeeId ? [{ recipientEmployeeId: identity.employeeId }] : []),
          ...(identity.email ? [{ recipientEmail: identity.email }] : []),
        ],
      };
      await Notification.updateMany(filter, { $addToSet: { readBy: req.user._id.toString() } });
    } else {
      await Notification.updateMany({ tenantId: req.tenantId }, { $set: { read: true } });
    }
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot delete notifications." });
    }
    await Notification.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notifications/clear-all
router.delete("/clear-all", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot clear notifications." });
    }
    await Notification.deleteMany({ tenantId: req.tenantId });
    return res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
