import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    employeeName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Staff",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
      index: true,
    },
    checkIn: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    checkOut: {
      type: String,
      default: "-",
    },
    hours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Half Day", "On Leave"],
      default: "Present",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ tenantId: 1, date: 1, employeeName: 1 });

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;
