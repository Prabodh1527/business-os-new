import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster,
} from "../controllers/master.controller.js";

const router = express.Router();

// ==========================================
// PROTECT ALL MASTER ROUTES
// ==========================================
router.use(protect);

// ==========================================
// MASTER COLLECTION
// GET  /api/masters
// POST /api/masters
// ==========================================
router
  .route("/")
  .get(getMasters)
  .post(createMaster);

// ==========================================
// SINGLE MASTER
// PATCH  /api/masters/:id
// DELETE /api/masters/:id
// ==========================================
router
  .route("/:id")
  .patch(updateMaster)
  .delete(deleteMaster);

export default router;