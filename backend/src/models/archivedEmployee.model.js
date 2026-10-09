import mongoose from "mongoose";

const archivedEmployeeSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Staff",
    },
    department: {
      type: String,
      default: "Operations",
    },
    salary: {
      type: Number,
      default: 0,
    },
    joinDate: {
      type: String,
      default: "",
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
    archivedBy: {
      type: String,
      default: "Owner",
    },
    reason: {
      type: String,
      default: "Employee offboarded and removed from active operations",
    },
    profileSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    payrollRecords: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    attendanceRecords: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    leaveRecords: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    appointments: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    tasks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

archivedEmployeeSchema.index({ tenantId: 1, archivedAt: -1 });

const ArchivedEmployee =
  mongoose.models.ArchivedEmployee ||
  mongoose.model("ArchivedEmployee", archivedEmployeeSchema);

export default ArchivedEmployee;
