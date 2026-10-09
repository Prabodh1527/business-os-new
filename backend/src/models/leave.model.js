import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
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
    type: {
      type: String,
      default: "Casual Leave",
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

leaveSchema.index({ tenantId: 1, createdAt: -1 });

const Leave = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);

export default Leave;
