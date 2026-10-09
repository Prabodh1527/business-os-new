import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Task from "../models/task.model.js";
import {
  employeeAssignmentFilter,
  getEmployeeIdentity,
  isEmployeeUser,
} from "../utils/employeeIdentity.js";

const router = express.Router();

router.use(protect, attachTenantDB);

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (isEmployeeUser(req)) {
      Object.assign(filter, employeeAssignmentFilter(await getEmployeeIdentity(req)));
    } else if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    tasks.forEach((t) => {
      if (t.status === "Pending") pendingCount++;
      else if (t.status === "In Progress") inProgressCount++;
      else if (t.status === "Completed") completedCount++;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalTasks: tasks.length,
        pendingCount,
        inProgressCount,
        completedCount,
      },
      tasks,
      data: tasks,
    });
  } catch (error) {
    console.error("❌ Get Tasks Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Task title is required." });
    }

    const identity = await getEmployeeIdentity(req);
    const newTask = await Task.create({
      tenantId: req.tenantId,
      title: title.trim(),
      description: description?.trim() || "",
      assignedTo: identity ? identity.name : assignedTo?.trim() || "Unassigned",
      assignedToEmail: identity ? identity.email : req.body.assignedToEmail || "",
      createdByUserId: identity ? req.user._id.toString() : "",
      priority: identity ? (["Low", "Medium", "High"].includes(priority) ? priority : "Medium") : priority || "Medium",
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      status: identity ? "Pending" : status || "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
      data: newTask,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    if (identity) {
      if (!["Pending", "In Progress", "Completed"].includes(req.body.status)) {
        return res.status(400).json({ success: false, message: "Invalid task status." });
      }
      const updated = await Task.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.tenantId, ...employeeAssignmentFilter(identity) },
        { $set: { status: req.body.status } },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: "Assigned task not found." });
      }
      return res.status(200).json({ success: true, message: "Task updated successfully", task: updated, data: updated });
    }

    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updated,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    const ownership = identity
      ? { createdByUserId: req.user._id.toString(), ...employeeAssignmentFilter(identity) }
      : {};
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
      ...ownership,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
