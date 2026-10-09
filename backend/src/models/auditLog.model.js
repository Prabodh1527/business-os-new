import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
      default: "System",
    },
    userRole: {
      type: String,
      default: "OWNER",
    },
    action: {
      type: String, // e.g. "CREATE_INVOICE", "DELETE_INVOICE", "EMAIL_INVOICE", "APPROVE_PAYROLL", "CLOCK_IN"
      required: true,
      index: true,
    },
    module: {
      type: String, // e.g. "INVOICES", "PAYROLL", "ATTENDANCE", "CRM", "INVENTORY"
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
