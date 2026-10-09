import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { attachTenantDB } from '../middleware/tenant.middleware.js';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';

const router = express.Router();

// Guard route with JWT authentication and tenant scoping
router.use(protect, attachTenantDB);

// GET /api/analytics
router.get('/', getDashboardAnalytics);

export default router;