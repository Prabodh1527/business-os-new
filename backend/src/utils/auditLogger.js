import AuditLog from "../models/auditLog.model.js";

/**
 * Records an audit log event asynchronously without blocking the request flow.
 */
export const recordAuditLog = ({
  tenantId,
  user,
  action,
  module,
  targetId = "",
  details = "",
  metadata = {},
  ip = "",
}) => {
  if (!tenantId || !action || !module) return;

  AuditLog.create({
    tenantId,
    userId: user?._id,
    userName: user?.name || user?.email || "System",
    userRole: user?.role || "OWNER",
    action,
    module,
    targetId,
    details,
    metadata,
    ipAddress: ip,
  }).catch((err) => {
    console.warn("⚠️ Audit log recording failed:", err.message);
  });
};
