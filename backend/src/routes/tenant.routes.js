import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  getMyTenant,
  updateMyTenant,
} from "../controllers/tenant.controller.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMyTenant);
router.put("/me", updateMyTenant);

export default router;