import mongoose from "mongoose";

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    employeeId: { type: String, default: "" },
    employeeEmail: { type: String, default: "", lowercase: true },
    employeeName: { type: String, required: true },
    date: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

attendanceCorrectionSchema.index({ tenantId: 1, createdAt: -1 });

const AttendanceCorrection =
  mongoose.models.AttendanceCorrection ||
  mongoose.model("AttendanceCorrection", attendanceCorrectionSchema);

export default AttendanceCorrection;
