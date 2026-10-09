import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Payroll from "../models/payroll.model.js";
import { getEmployeeIdentity, isEmployeeUser } from "../utils/employeeIdentity.js";

const router = express.Router();

router.use(protect, attachTenantDB);

// GET /api/payroll
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
    const payrolls = await Payroll.find(filter).sort({ createdAt: -1 });

    let totalPayroll = 0;
    let paidAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;

    payrolls.forEach((p) => {
      const net = Number(p.net || 0);
      totalPayroll += net;
      if (p.status === "Paid") {
        paidAmount += net;
        paidCount++;
      } else {
        pendingCount++;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: payrolls.length,
        totalPayroll,
        paidAmount,
        paidCount,
        pendingCount,
      },
      payroll: payrolls,
      data: payrolls,
    });
  } catch (error) {
    console.error("❌ Get Payroll Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payroll
router.post("/", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot create payroll records." });
    }
    const { employee, employeeId = "", employeeEmail = "", role, month, salary, bonus = 0, deduction = 0, status } = req.body;

    if (!employee || !salary) {
      return res.status(400).json({ success: false, message: "Employee and salary are required." });
    }

    const numSalary = Number(salary) || 0;
    const numBonus = Number(bonus) || 0;
    const numDeduction = Number(deduction) || 0;
    const net = numSalary + numBonus - numDeduction;

    const currentMonth = month || new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    const newRecord = await Payroll.create({
      tenantId: req.tenantId,
      employee,
      employeeId,
      employeeEmail,
      role: role || "Staff",
      month: currentMonth,
      salary: numSalary,
      bonus: numBonus,
      deduction: numDeduction,
      net,
      status: status || "Pending",
      paidDate: status === "Paid" ? new Date().toISOString().slice(0, 10) : "",
    });

    return res.status(201).json({
      success: true,
      message: "Payroll entry created successfully",
      payroll: newRecord,
      data: newRecord,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/payroll/:id
router.patch("/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot edit payroll records." });
    }
    const updateData = { ...req.body };
    if (updateData.status === "Paid" && !updateData.paidDate) {
      updateData.paidDate = new Date().toISOString().slice(0, 10);
    }

    const updated = await Payroll.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Payroll entry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      payroll: updated,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/payroll/:id
router.delete("/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot delete payroll records." });
    }
    const deleted = await Payroll.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Payroll entry not found" });
    }

    return res.status(200).json({ success: true, message: "Payroll entry deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
