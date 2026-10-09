import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Attendance from "../models/attendance.model.js";
import AttendanceCorrection from "../models/attendanceCorrection.model.js";
import { getEmployeeIdentity, isEmployeeUser } from "../utils/employeeIdentity.js";

const router = express.Router();

router.use(protect, attachTenantDB);

router.get("/corrections", async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      filter.$or = [
        ...(identity.employeeId ? [{ employeeId: identity.employeeId }] : []),
        ...(identity.email ? [{ employeeEmail: identity.email }] : []),
        ...(identity.name ? [{ employeeName: identity.name }] : []),
      ];
    }
    const corrections = await AttendanceCorrection.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, corrections, data: corrections });
  } catch (error) {
    console.error("❌ Fetch Attendance Corrections Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/corrections", async (req, res) => {
  try {
    if (!isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employee access only." });
    }
    const identity = await getEmployeeIdentity(req);
    const { date, checkIn, checkOut, reason } = req.body;
    if (!date || !checkIn || !checkOut || !reason?.trim()) {
      return res.status(400).json({ success: false, message: "Date, both punch times, and a reason are required." });
    }
    const correction = await AttendanceCorrection.create({
      tenantId: req.tenantId,
      employeeId: identity.employeeId,
      employeeEmail: identity.email,
      employeeName: identity.name,
      date,
      checkIn,
      checkOut,
      reason: reason.trim(),
    });
    return res.status(201).json({ success: true, correction, data: correction });
  } catch (error) {
    console.error("❌ Create Attendance Correction Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.patch("/corrections/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot review attendance corrections." });
    }
    if (!["Approved", "Rejected"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "A valid correction status is required." });
    }
    const correction = await AttendanceCorrection.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, status: "Pending" },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    if (!correction) {
      return res.status(404).json({ success: false, message: "Pending attendance correction not found." });
    }
    if (req.body.status === "Approved") {
      await Attendance.findOneAndUpdate(
        {
          tenantId: req.tenantId,
          date: correction.date,
          ...(correction.employeeId ? { employeeId: correction.employeeId } : { employeeName: correction.employeeName }),
        },
        {
          $set: {
            employeeId: correction.employeeId,
            employeeName: correction.employeeName,
            date: correction.date,
            checkIn: correction.checkIn,
            checkOut: correction.checkOut,
            status: "Present",
            notes: `Attendance correction approved: ${correction.reason}`,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );
    }
    return res.status(200).json({ success: true, correction, data: correction });
  } catch (error) {
    console.error("❌ Review Attendance Correction Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/attendance
router.get("/", async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (req.query.date) filter.date = req.query.date;
    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      filter.$or = [
        ...(identity.employeeId ? [{ employeeId: identity.employeeId }] : []),
        ...(identity.name ? [{ employeeName: identity.name }] : []),
      ];
    } else if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }

    const records = await Attendance.find(filter).sort({ createdAt: -1 });

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecords = records.filter((r) => r.date === todayStr);

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    todayRecords.forEach((r) => {
      if (r.status === "Present") presentCount++;
      else if (r.status === "Late") lateCount++;
      else if (r.status === "Absent") absentCount++;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalRecords: records.length,
        todayTotal: todayRecords.length,
        presentCount,
        lateCount,
        absentCount,
      },
      attendance: records,
      data: records,
    });
  } catch (error) {
    console.error("❌ Get Attendance Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/clock-in
router.post("/clock-in", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    const { employeeId, employeeName, role } = req.body;
    const name = identity?.name || employeeName || req.user?.name || "Staff Member";
    const resolvedEmployeeId = identity?.employeeId || employeeId || req.user?._id?.toString() || "";
    const todayStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let record = await Attendance.findOne({
      tenantId: req.tenantId,
      date: todayStr,
      ...(resolvedEmployeeId ? { employeeId: resolvedEmployeeId } : { employeeName: name }),
    });

    if (record) {
      return res.status(200).json({
        success: true,
        message: "Already clocked in today",
        attendance: record,
        data: record,
      });
    }

    record = await Attendance.create({
      tenantId: req.tenantId,
      employeeId: resolvedEmployeeId,
      employeeName: name,
      role: identity?.role || role || req.user?.role || "Staff",
      date: todayStr,
      checkIn: timeStr,
      checkOut: "-",
      status: "Present",
    });

    return res.status(201).json({
      success: true,
      message: `Clocked in at ${timeStr}`,
      attendance: record,
      data: record,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/clock-out
router.post("/clock-out", async (req, res) => {
  try {
    const identity = await getEmployeeIdentity(req);
    const name = identity?.name || req.body.employeeName || req.user?.name;
    const todayStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const record = await Attendance.findOne({
      tenantId: req.tenantId,
      date: todayStr,
      ...(identity?.employeeId ? { employeeId: identity.employeeId } : { employeeName: name }),
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No clock-in record found for today",
      });
    }

    record.checkOut = timeStr;
    const checkIn = new Date(`1970-01-01 ${record.checkIn}`);
    const checkOut = new Date(`1970-01-01 ${timeStr}`);
    const elapsedMs = checkOut - checkIn;
    if (!Number.isNaN(elapsedMs) && elapsedMs >= 0) {
      record.hours = Math.round((elapsedMs / 3600000) * 100) / 100;
    }
    await record.save();

    return res.status(200).json({
      success: true,
      message: `Clocked out at ${timeStr}`,
      attendance: record,
      data: record,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/attendance
router.post("/", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Use the clock-in action to record attendance." });
    }
    const { employeeName, role, date, checkIn, checkOut, status, notes } = req.body;

    if (!employeeName) {
      return res.status(400).json({ success: false, message: "Employee name is required" });
    }

    const newRecord = await Attendance.create({
      tenantId: req.tenantId,
      employeeName,
      role: role || "Staff",
      date: date || new Date().toISOString().slice(0, 10),
      checkIn: checkIn || "09:00 AM",
      checkOut: checkOut || "-",
      status: status || "Present",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Attendance recorded",
      attendance: newRecord,
      data: newRecord,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /:id
router.patch("/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot edit attendance records." });
    }
    const updated = await Attendance.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Record not found" });
    return res.status(200).json({ success: true, message: "Updated", attendance: updated, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
