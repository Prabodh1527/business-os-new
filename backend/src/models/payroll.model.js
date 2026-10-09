import mongoose from "mongoose";

const deductionLineSchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String },
  value: { type: Number, default: 0 },
}, { _id: false });

const payrollSchema = new mongoose.Schema({
  tenantId:      { type: String, required: true, index: true },
  // Employee refs
  employeeId:    { type: String, default: "" },
  employeeEmail: { type: String, default: "", lowercase: true },
  employee:      { type: String, required: true },
  role:          { type: String, default: "Staff" },
  department:    { type: String, default: "" },
  // Period
  month:         { type: String, required: true }, // "October 2026"
  year:          { type: Number },
  monthNum:      { type: Number }, // 1-12 for sorting
  // Earnings
  baseSalary:    { type: Number, default: 0 },  // from employee record
  bonus:         { type: Number, default: 0 },
  // Attendance snapshot
  workDaysInMonth:  { type: Number, default: 26 },
  paidDays:         { type: Number, default: 26 },
  unpaidDays:       { type: Number, default: 0 },
  lossOfPay:        { type: Number, default: 0 },   // calculated LOP amount
  // Deductions (frozen at approval time)
  deductionLines:   [deductionLineSchema],
  totalDeductions:  { type: Number, default: 0 },
  // Totals
  grossEarnings:    { type: Number, default: 0 },   // baseSalary - lop + bonus
  netSalary:        { type: Number, default: 0 },   // grossEarnings - totalDeductions
  // Legacy aliases kept for backward compat
  salary:    { type: Number, default: 0 },   // mirrors baseSalary
  deduction: { type: Number, default: 0 },   // mirrors totalDeductions
  net:       { type: Number, default: 0 },   // mirrors netSalary
  // Status workflow: Draft → Calculated → Approved → Paid
  status: {
    type: String,
    enum: ["Draft", "Calculated", "Approved", "Paid", "Pending"],
    default: "Draft",
  },
  // Approval / payment
  approvedAt:   { type: Date },
  approvedBy:   { type: String, default: "" },
  paidDate:     { type: String, default: "" },
  paymentRef:   { type: String, default: "" },
  payslipSentAt: { type: Date },
  // Frozen rule snapshot (so past payslips are immutable)
  payrollRulesSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: { type: String, default: "" },
}, { timestamps: true });

payrollSchema.index({ tenantId: 1, month: 1 });
payrollSchema.index({ tenantId: 1, employeeId: 1, month: 1 });

const Payroll = mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema);
export default Payroll;
