// backend/src/middleware/tenant.middleware.js

export const attachTenantDB = (req, res, next) => {
  if (!req.tenantId) {
    req.tenantId =
      req.user?.tenantId?.toString() ||
      req.user?.companyId?.toString() ||
      req.user?._id?.toString();
  }

  if (!req.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Tenant identifier missing from request context.",
    });
  }

  next();
};