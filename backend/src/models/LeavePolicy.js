import mongoose from "mongoose";

const leaveTypeConfigSchema = new mongoose.Schema({
  type: { type: String, required: true },        // e.g. "Casual Leave"
  entitledPerYear: { type: Number, default: 12 }, // total days per year
  accrualType: { type: String, enum: ["monthly", "yearly", "none"], default: "monthly" },
  isPaid: { type: Boolean, default: true },
  maxCarryForward: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
}, { _id: true });

const leavePolicySchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true, unique: true },
  leaveTypes: [leaveTypeConfigSchema],
  // LOP deduction: how many approved unpaid-leave days reduce salary
  lopEnabled: { type: Boolean, default: true },
  // Auto-approve after N days if no action taken (0 = never)
  autoApproveDays: { type: Number, default: 0 },
  // Notes
  notes: { type: String, default: "" },
}, { timestamps: true });

const LeavePolicy = mongoose.models.LeavePolicy || mongoose.model("LeavePolicy", leavePolicySchema);
export default LeavePolicy;
