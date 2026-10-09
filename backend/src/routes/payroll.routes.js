import express from "express";
import nodemailer from "nodemailer";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Payroll from "../models/payroll.model.js";
import Employee from "../models/employee.model.js";
import Attendance from "../models/attendance.model.js";
import Leave from "../models/leave.model.js";
import PayrollRule from "../models/PayrollRule.js";
import Tenant from "../models/Tenant.js";
import { getEmployeeIdentity, isEmployeeUser } from "../utils/employeeIdentity.js";
import { generatePayslipPdfBuffer } from "../utils/payslipPdf.js";

const router = express.Router();
router.use(protect, attachTenantDB);

function getMonthYear(monthStr) {
  const d = new Date(`01 ${monthStr}`);
  if (!isNaN(d)) return { year: d.getFullYear(), monthNum: d.getMonth() + 1 };
  const now = new Date();
  return { year: now.getFullYear(), monthNum: now.getMonth() + 1 };
}

function daysInMonth(year, monthNum) {
  return new Date(year, monthNum, 0).getDate();
}

function calculatePayrollMath(baseSalary, bonus, paidDays, workDaysInMonth, rules) {
  const numBase = Number(baseSalary) || 0;
  const numBonus = Number(bonus) || 0;
  const numPaid = Math.max(0, Number(paidDays));
  const numWork = Math.max(1, Number(workDaysInMonth) || 26);

  // Loss of Pay
  let lop = 0;
  if (numPaid < numWork) {
    const dailyRate = numBase / numWork;
    const unpaidDays = numWork - numPaid;
    lop = Math.round(unpaidDays * dailyRate * 100) / 100;
  }

  // Gross Earnings = Base Salary - LOP + Bonus (or Base Salary + Bonus, depending on LOP presentation)
  // Per specification: Gross Earnings = Base Salary + Additional Earnings; Total Deductions = Loss of Pay + Employee Deductions; Net = Gross - Deductions
  const grossEarnings = numBase + numBonus;

  const deductionLines = [];
  let totalDeductions = lop; // Start with LOP as a deduction

  if (rules?.deductions && Array.isArray(rules.deductions)) {
    for (const d of rules.deductions) {
      if (!d.enabled) continue;
      const basis = d.appliesTo === "basic" ? numBase : Math.max(0, grossEarnings - lop);
      let amount = 0;
      if (d.type === "percentage") {
        amount = Math.round((basis * Number(d.value) / 100) * 100) / 100;
      } else {
        amount = Number(d.value) || 0;
      }
      if (d.minLimit && amount < d.minLimit) amount = d.minLimit;
      if (d.maxLimit && amount > d.maxLimit) amount = d.maxLimit;

      if (amount > 0) {
        deductionLines.push({ name: d.name, type: d.type, value: amount });
        totalDeductions += amount;
      }
    }
  }

  // Income Tax / TDS slab
  if (rules?.taxEnabled && rules?.taxSlab?.length) {
    const annualGross = (grossEarnings - lop) * 12;
    let tax = 0;
    for (const slab of rules.taxSlab) {
      if (annualGross <= slab.upTo || slab.upTo === 0) {
        tax = annualGross * (Number(slab.rate) / 100);
        break;
      }
    }
    const monthlyTax = Math.round((tax / 12) * 100) / 100;
    if (monthlyTax > 0) {
      deductionLines.push({ name: "Income Tax (TDS)", type: "percentage", value: monthlyTax });
      totalDeductions += monthlyTax;
    }
  }

  // Cap total deductions so net salary never becomes negative
  totalDeductions = Math.min(totalDeductions, grossEarnings);
  totalDeductions = Math.round(totalDeductions * 100) / 100;
  const netSalary = Math.max(0, Math.round((grossEarnings - totalDeductions) * 100) / 100);

  return {
    lop,
    grossEarnings,
    deductionLines,
    totalDeductions,
    netSalary,
  };
}

// ── GET /api/payroll/rules ───────────────────────────────────────────────────
router.get("/rules", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    let rules = await PayrollRule.findOne({ tenantId: req.tenantId });
    if (!rules) {
      rules = await PayrollRule.create({
        tenantId: req.tenantId,
        workDaysPerMonth: 26,
        standardHoursPerDay: 8,
        taxEnabled: false,
        deductions: [
          { name: "Provident Fund (PF)", type: "percentage", value: 12, appliesTo: "basic", enabled: true },
          { name: "Professional Tax",   type: "flat",       value: 200, appliesTo: "gross", enabled: true },
        ],
        notes: "Default business tax and statutory deduction configuration.",
      });
    }
    return res.status(200).json({ success: true, rules, data: rules });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/payroll/rules ───────────────────────────────────────────────────
router.put("/rules", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    const rules = await PayrollRule.findOneAndUpdate(
      { tenantId: req.tenantId },
      { $set: { ...req.body, tenantId: req.tenantId } },
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ success: true, message: "Payroll rules updated successfully", rules, data: rules });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// ── POST /api/payroll/calculate ──────────────────────────────────────────────
router.post("/calculate", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    const { month } = req.body;
    if (!month) return res.status(400).json({ success: false, message: "Payroll month is required" });

    const { year, monthNum } = getMonthYear(month);
    const rules = await PayrollRule.findOne({ tenantId: req.tenantId });
    const workDays = rules?.workDaysPerMonth || 26;

    // Load active employees
    const employees = await Employee.find({ tenantId: req.tenantId, status: "ACTIVE" });
    if (!employees.length) {
      return res.status(400).json({ success: false, message: "No active employees found to process payroll." });
    }

    const monthStart = `${year}-${String(monthNum).padStart(2, "0")}-01`;
    const monthEnd = `${year}-${String(monthNum).padStart(2, "0")}-${String(daysInMonth(year, monthNum)).padStart(2, "0")}`;

    const results = [];
    for (const emp of employees) {
      // Find existing record for this month
      const existing = await Payroll.findOne({
        tenantId: req.tenantId,
        month,
        $or: [{ employeeId: emp.employeeId }, { employeeEmail: emp.email }, { employee: emp.name }],
      });

      // Preserve previously approved or paid records! (Critical requirement #3)
      if (existing && ["Approved", "Paid"].includes(existing.status)) {
        results.push(existing);
        continue;
      }

      // Check attendance records for the month
      const attRecords = await Attendance.find({
        tenantId: req.tenantId,
        $or: [{ employeeId: emp.employeeId }, { employeeName: emp.name }],
        date: { $gte: monthStart, $lte: monthEnd },
      });

      // Check approved leaves for the month
      const leaves = await Leave.find({
        tenantId: req.tenantId,
        status: "Approved",
        $or: [{ employeeId: emp.employeeId }, { employeeEmail: emp.email }, { employee: emp.name }],
        from: { $lte: monthEnd },
        to:   { $gte: monthStart },
      });

      let presentDays = 0;
      let unapprovedAbsentDays = 0;
      attRecords.forEach(r => {
        if (r.status === "Present" || r.status === "Late") presentDays += 1;
        else if (r.status === "Half Day") presentDays += 0.5;
        else if (r.status === "Absent") unapprovedAbsentDays += 1;
      });

      let approvedPaidLeaveDays = 0;
      let approvedUnpaidLeaveDays = 0;
      leaves.forEach(l => {
        const days = Number(l.days || 1);
        if (l.isPaid) approvedPaidLeaveDays += days;
        else approvedUnpaidLeaveDays += days;
      });

      // Compute paidDays
      let paidDays = workDays;
      if (attRecords.length > 0) {
        paidDays = Math.min(workDays, presentDays + approvedPaidLeaveDays);
      } else if (approvedUnpaidLeaveDays > 0) {
        paidDays = Math.max(0, workDays - approvedUnpaidLeaveDays);
      }

      const baseSalary = Number(emp.salary) || 0;
      const bonus = existing ? Number(existing.bonus || 0) : 0;
      const calc = calculatePayrollMath(baseSalary, bonus, paidDays, workDays, rules);

      const payload = {
        tenantId: req.tenantId,
        employeeId: emp.employeeId,
        employeeEmail: emp.email || "",
        employee: emp.name,
        role: emp.role || "Staff",
        department: emp.department || "Operations",
        month,
        year,
        monthNum,
        baseSalary,
        bonus,
        workDaysInMonth: workDays,
        paidDays,
        unpaidDays: Math.max(0, workDays - paidDays),
        lossOfPay: calc.lop,
        deductionLines: calc.deductionLines,
        totalDeductions: calc.totalDeductions,
        grossEarnings: calc.grossEarnings,
        netSalary: calc.netSalary,
        // Legacy compat fields
        salary: baseSalary,
        deduction: calc.totalDeductions,
        net: calc.netSalary,
        status: existing?.status === "Reviewed" ? "Reviewed" : "Calculated",
        payrollRulesSnapshot: rules ? rules.toObject() : {},
      };

      let savedRecord;
      if (existing) {
        savedRecord = await Payroll.findByIdAndUpdate(existing._id, { $set: payload }, { new: true });
      } else {
        savedRecord = await Payroll.create(payload);
      }
      results.push(savedRecord);
    }

    return res.status(200).json({
      success: true,
      message: `Payroll calculation generated for ${results.length} employee(s).`,
      payroll: results,
      data: results,
    });
  } catch (err) {
    console.error("❌ Calculate Payroll Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payroll/:id/recalculate (adjust single employee record) ─────────
router.post("/:id/recalculate", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    const record = await Payroll.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!record) return res.status(404).json({ success: false, message: "Payroll record not found" });

    if (["Approved", "Paid"].includes(record.status)) {
      return res.status(400).json({ success: false, message: "Approved/Paid payroll records are locked and cannot be recalculated." });
    }

    const rules = await PayrollRule.findOne({ tenantId: req.tenantId });
    const workDays = rules?.workDaysPerMonth || record.workDaysInMonth || 26;

    const bonus = req.body.bonus !== undefined ? Number(req.body.bonus) : record.bonus;
    const paidDays = req.body.paidDays !== undefined ? Number(req.body.paidDays) : record.paidDays;
    const notes = req.body.notes !== undefined ? req.body.notes : record.notes;

    const calc = calculatePayrollMath(record.baseSalary, bonus, paidDays, workDays, rules);

    const updated = await Payroll.findByIdAndUpdate(
      record._id,
      {
        $set: {
          bonus,
          paidDays,
          unpaidDays: Math.max(0, workDays - paidDays),
          lossOfPay: calc.lop,
          deductionLines: calc.deductionLines,
          totalDeductions: calc.totalDeductions,
          grossEarnings: calc.grossEarnings,
          netSalary: calc.netSalary,
          salary: record.baseSalary,
          deduction: calc.totalDeductions,
          net: calc.netSalary,
          notes,
          status: "Reviewed",
          payrollRulesSnapshot: rules ? rules.toObject() : record.payrollRulesSnapshot,
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Record recalculated and reviewed", data: updated, payroll: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payroll/:id/approve ─────────────────────────────────────────────
router.post("/:id/approve", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    const record = await Payroll.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!record) return res.status(404).json({ success: false, message: "Payroll record not found" });

    if (record.status === "Approved" || record.status === "Paid") {
      return res.status(400).json({ success: false, message: `Payroll is already ${record.status}` });
    }

    // Freeze snapshot so changing next month's tax rules will NOT alter this approved payslip
    const rules = await PayrollRule.findOne({ tenantId: req.tenantId });
    record.status = "Approved";
    record.approvedAt = new Date();
    record.approvedBy = req.user?.name || req.user?.email || "Business Owner";
    record.payrollRulesSnapshot = rules ? rules.toObject() : record.payrollRulesSnapshot;
    await record.save();

    return res.status(200).json({ success: true, message: "Payroll approved successfully", data: record, payroll: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payroll/:id/pay ─────────────────────────────────────────────────
router.post("/:id/pay", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    const { paymentRef = "", paymentDate } = req.body;
    const record = await Payroll.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!record) return res.status(404).json({ success: false, message: "Payroll record not found" });

    record.status = "Paid";
    record.paidDate = paymentDate || new Date().toISOString().slice(0, 10);
    record.paymentRef = paymentRef || `UTR-${Date.now()}`;
    await record.save();

    return res.status(200).json({ success: true, message: "Payroll marked as Paid", data: record, payroll: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payroll/:id/payslip (download real PDF) ──────────────────────────
router.get("/:id/payslip", async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.tenantId };
    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      filter.$or = [
        ...(identity.employeeId ? [{ employeeId: identity.employeeId }] : []),
        ...(identity.email ? [{ employeeEmail: identity.email }] : []),
        ...(identity.name ? [{ employee: identity.name }] : []),
      ];
    }
    const record = await Payroll.findOne(filter);
    if (!record) return res.status(404).json({ success: false, message: "Payslip not found or access denied." });

    const tenant = await Tenant.findOne({ _id: req.tenantId }) || await Tenant.findOne({ ownerId: req.user?._id });
    const employee = await Employee.findOne({ tenantId: req.tenantId, employeeId: record.employeeId });

    const pdfBuffer = await generatePayslipPdfBuffer(record, tenant, employee);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Payslip_${(record.employee || "Staff").replace(/\s+/g, "_")}_${record.month.replace(/\s+/g, "_")}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ Payslip PDF generation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payroll/:id/send (email payslip PDF to employee) ────────────────
router.post("/:id/send", async (req, res) => {
  try {
    if (isEmployeeUser(req)) return res.status(403).json({ success: false, message: "Owner access only." });
    const record = await Payroll.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!record) return res.status(404).json({ success: false, message: "Payroll record not found" });

    const recipientEmail = record.employeeEmail || (await Employee.findOne({ tenantId: req.tenantId, employeeId: record.employeeId }))?.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: "Employee has no email address configured in the system." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({
        success: false,
        message: "Email SMTP configuration is missing in the environment. Please configure SMTP_USER and SMTP_PASS to send payslips via email.",
      });
    }

    const tenant = await Tenant.findOne({ _id: req.tenantId }) || await Tenant.findOne({ ownerId: req.user?._id });
    const employee = await Employee.findOne({ tenantId: req.tenantId, employeeId: record.employeeId });
    const pdfBuffer = await generatePayslipPdfBuffer(record, tenant, employee);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${tenant?.companyName || "Business OS"}" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Official Salary Statement - ${record.month} - ${tenant?.companyName || "Business OS"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background: #f8fafc; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">Salary Statement Issued</h2>
          <p>Dear <strong>${record.employee}</strong>,</p>
          <p>Your official salary statement for <strong>${record.month}</strong> has been finalized and issued.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr style="border-bottom: 1px solid #e2e8f0; padding: 10px;">
              <td style="padding: 10px; color: #64748b;">Gross Earnings:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right;">₹${Number(record.grossEarnings || record.salary || 0).toLocaleString("en-IN")}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; padding: 10px;">
              <td style="padding: 10px; color: #64748b;">Total Deductions:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #e11d48;">₹${Number(record.totalDeductions || record.deduction || 0).toLocaleString("en-IN")}</td>
            </tr>
            <tr style="background: #f1f5f9; padding: 10px;">
              <td style="padding: 10px; font-weight: bold; color: #1e293b;">Net Take-Home Pay:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #059669; font-size: 16px;">₹${Number(record.netSalary || record.net || 0).toLocaleString("en-IN")}</td>
            </tr>
          </table>
          <p>Attached is your formal PDF payslip with complete itemized breakdown of earnings, deductions, and attendance records.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This is an automated communication from ${tenant?.companyName || "Business OS"}. Please do not reply directly to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Payslip_${record.month.replace(/\s+/g, "_")}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    record.payslipSentAt = new Date();
    await record.save();

    return res.status(200).json({
      success: true,
      message: `Payslip successfully emailed to ${recipientEmail}`,
      payslipSentAt: record.payslipSentAt,
      data: record,
    });
  } catch (err) {
    console.error("❌ Send payslip email error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to deliver payslip email." });
  }
});

// ── GET /api/payroll (list with filters) ──────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (req.query.month) filter.month = req.query.month;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;

    if (isEmployeeUser(req)) {
      const identity = await getEmployeeIdentity(req);
      filter.$or = [
        ...(identity.employeeId ? [{ employeeId: identity.employeeId }] : []),
        ...(identity.email ? [{ employeeEmail: identity.email }] : []),
        ...(identity.name ? [{ employee: identity.name }] : []),
      ];
    } else if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }

    const payrolls = await Payroll.find(filter).sort({ createdAt: -1 });

    // Distinct months
    const allMonths = [...new Set(payrolls.map((p) => p.month))];

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let paidAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let calculatedCount = 0;

    payrolls.forEach((p) => {
      const net = Number(p.netSalary || p.net || 0);
      const gross = Number(p.grossEarnings || p.baseSalary || p.salary || 0);
      const ded = Number(p.totalDeductions || p.deduction || 0);

      totalNet += net;
      totalGross += gross;
      totalDeductions += ded;

      if (p.status === "Paid") {
        paidAmount += net;
        paidCount++;
      } else if (p.status === "Approved") {
        approvedCount++;
      } else if (p.status === "Calculated" || p.status === "Reviewed") {
        calculatedCount++;
      } else {
        pendingCount++;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: payrolls.length,
        totalGross,
        totalDeductions,
        totalNet,
        totalPayroll: totalNet,
        paidAmount,
        paidCount,
        approvedCount,
        calculatedCount,
        pendingCount,
      },
      payroll: payrolls,
      data: payrolls,
      months: allMonths,
    });
  } catch (error) {
    console.error("❌ Get Payroll Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/payroll (manual creation) ───────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot create payroll records." });
    }
    const { employee, employeeId = "", employeeEmail = "", role, department = "", month, salary, bonus = 0, deduction = 0, status, paidDays } = req.body;

    if (!employee || !salary) {
      return res.status(400).json({ success: false, message: "Employee and salary are required." });
    }

    const rules = await PayrollRule.findOne({ tenantId: req.tenantId });
    const workDays = rules?.workDaysPerMonth || 26;
    const currentMonth = month || new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const { year, monthNum } = getMonthYear(currentMonth);

    const numSalary = Number(salary) || 0;
    const numBonus = Number(bonus) || 0;
    const numPaidDays = paidDays !== undefined ? Number(paidDays) : workDays;

    const calc = calculatePayrollMath(numSalary, numBonus, numPaidDays, workDays, rules);

    const newRecord = await Payroll.create({
      tenantId: req.tenantId,
      employee,
      employeeId,
      employeeEmail,
      role: role || "Staff",
      department: department || "Operations",
      month: currentMonth,
      year,
      monthNum,
      baseSalary: numSalary,
      bonus: numBonus,
      workDaysInMonth: workDays,
      paidDays: numPaidDays,
      unpaidDays: Math.max(0, workDays - numPaidDays),
      lossOfPay: calc.lop,
      deductionLines: calc.deductionLines,
      totalDeductions: Number(deduction) || calc.totalDeductions,
      grossEarnings: calc.grossEarnings,
      netSalary: calc.netSalary,
      salary: numSalary,
      deduction: Number(deduction) || calc.totalDeductions,
      net: calc.netSalary,
      status: status || "Calculated",
      payrollRulesSnapshot: rules ? rules.toObject() : {},
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

// ── PATCH /api/payroll/:id ────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    if (isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employees cannot edit payroll records." });
    }
    const updateData = { ...req.body };
    if (updateData.status === "Paid" && !updateData.paidDate) {
      updateData.paidDate = new Date().toISOString().slice(0, 10);
    }
    if (updateData.netSalary !== undefined) updateData.net = updateData.netSalary;
    if (updateData.totalDeductions !== undefined) updateData.deduction = updateData.totalDeductions;
    if (updateData.baseSalary !== undefined) updateData.salary = updateData.baseSalary;

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

// ── DELETE /api/payroll/:id ───────────────────────────────────────────────────
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
