import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      default: "",
    },
    employeeEmail: {
      type: String,
      default: "",
      lowercase: true,
    },
    employee: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Staff",
    },
    month: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deduction: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    paidDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

payrollSchema.index({ tenantId: 1, month: 1 });

const Payroll = mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema);

export default Payroll;
