import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Leave from "../models/leave.model.js";
import { getEmployeeIdentity, isEmployeeUser } from "../utils/employeeIdentity.js";

const router = express.Router();

router.use(protect, attachTenantDB);

// GET /api/leaves
router.get("/", async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      filter.$or = [
        ...(identity.employeeId ? [{ employeeId: identity.employeeId }] : []),
        ...(identity.email ? [{ employeeEmail: identity.email }] : []),
        ...(identity.name ? [{ employee: identity.name }] : []),
      ];
    }
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    leaves.forEach((l) => {
      if (l.status === "Pending") pendingCount++;
      else if (l.status === "Approved") approvedCount++;
      else if (l.status === "Rejected") rejectedCount++;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalLeaves: leaves.length,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
      leaves,
      data: leaves,
    });
  } catch (error) {
    console.error("❌ Get Leaves Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leaves
router.post("/", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    const { employee, employeeId = "", employeeEmail = "", role, type, from, to, days, reason } = req.body;

    const empName = identity?.name || employee || req.user?.name;
    if (!empName || !from || !to || !reason) {
      return res.status(400).json({
        success: false,
        message: "Employee, start date, end date, and reason are required.",
      });
    }

    const newLeave = await Leave.create({
      tenantId: req.tenantId,
      employeeId: identity?.employeeId || employeeId || req.user?._id?.toString() || "",
      employeeEmail: identity?.email || employeeEmail || req.user?.email || "",
      employee: empName,
      role: identity?.role || role || req.user?.role || "Staff",
      type: type || "Casual Leave",
      from,
      to,
      days: Number(days) || 1,
      reason,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully!",
      leave: newLeave,
      data: newLeave,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/leaves/:id
router.patch("/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot approve leave requests." });
    }
    const updated = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Leave record not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${updated.status}`,
      leave: updated,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/leaves/:id
router.delete("/:id", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    const deleted = await Leave.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
      ...(identity
        ? {
            status: "Pending",
            $or: [
              ...(identity.employeeId ? [{ employeeId: identity.employeeId }] : []),
              ...(identity.email ? [{ employeeEmail: identity.email }] : []),
              ...(identity.name ? [{ employee: identity.name }] : []),
            ],
          }
        : {}),
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Leave record not found" });
    }

    return res.status(200).json({ success: true, message: "Leave record deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
