import mongoose from "mongoose";

const deductionRuleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "PF", "ESI", "Professional Tax"
  type: { type: String, enum: ["percentage", "flat"], default: "percentage" },
  value: { type: Number, required: true, default: 0 },
  appliesTo: { type: String, enum: ["gross", "basic"], default: "gross" },
  enabled: { type: Boolean, default: true },
}, { _id: true });

const payrollRuleSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true, unique: true },
  // Work days configuration
  workDaysPerMonth: { type: Number, default: 26 },
  standardHoursPerDay: { type: Number, default: 8 },
  lopPerDay: { type: String, enum: ["salary/workDays", "flat"], default: "salary/workDays" },
  // Tax
  taxEnabled: { type: Boolean, default: false },
  taxSlab: [{
    upTo: { type: Number, default: 0 },   // 0 = no upper limit
    rate: { type: Number, default: 0 },   // percentage
  }],
  // Deductions
  deductions: [deductionRuleSchema],
  // Bonus
  defaultBonusType: { type: String, enum: ["flat", "percentage"], default: "flat" },
  // Notes / policy description
  notes: { type: String, default: "" },
}, { timestamps: true });

const PayrollRule = mongoose.models.PayrollRule || mongoose.model("PayrollRule", payrollRuleSchema);
export default PayrollRule;
