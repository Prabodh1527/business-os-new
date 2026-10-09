import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import AuditLog from "../models/auditLog.model.js";

const router = express.Router();
router.use(protect, attachTenantDB);

/**
 * GET /api/audit-logs
 * Fetch system audit events with pagination and filters
 */
router.get("/", async (req, res) => {
  try {
    const { module, action, limit = 50, page = 1 } = req.query;
    const filter = { tenantId: req.tenantId };

    if (module) filter.module = module;
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
