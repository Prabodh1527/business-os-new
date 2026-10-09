import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Tenant from "../models/Tenant.js";
import {
  getDetailedBusinessSnapshot,
  calculateBusinessHealth,
  generateEvidenceBackedInsights,
  generatePredictiveForecasts,
  generatePrioritizedRecommendations,
} from "../services/businessAnalyst.service.js";
import {
  identifyRequiredTools,
  executeToolsForTenant,
} from "../services/modelTools.service.js";
import { ModelProviderService } from "../services/modelProvider.service.js";

const router = express.Router();
router.use(protect, attachTenantDB);

// ==========================================
// 1. GET /api/ai/health
// Business Health Analysis with 4 Pillars & Breakdown
// ==========================================
router.get("/health", async (req, res) => {
  try {
    const { metrics } = await getDetailedBusinessSnapshot(req.tenantId);
    const health = calculateBusinessHealth(metrics);

    return res.status(200).json({
      success: true,
      data: {
        score: health.score,
        overallScore: health.score,
        status: health.status,
        summary: health.summary,
        pillars: health.pillars,
        categories: health.pillars.map((p) => ({
          title: p.name,
          score: `${p.percent}%`,
          description: p.factors[0] || "Operating within benchmark ranges.",
          factors: p.factors,
        })),
        recommendations: generatePrioritizedRecommendations(metrics).map((r) => r.suggestedAction),
        metrics,
      },
    });
  } catch (error) {
    console.error("❌ AI Health Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET /api/ai/insights
// Automated Evidence-Backed Discovery
// ==========================================
router.get("/insights", async (req, res) => {
  try {
    const { metrics } = await getDetailedBusinessSnapshot(req.tenantId);
    const health = calculateBusinessHealth(metrics);
    const insights = generateEvidenceBackedInsights(metrics);
    const predictions = generatePredictiveForecasts(metrics);
    const recommendations = generatePrioritizedRecommendations(metrics);

    return res.status(200).json({
      success: true,
      data: {
        insights,
        predictions,
        recommendations,
        health,
        stats: metrics,
      },
      insights,
      predictions,
      recommendations,
    });
  } catch (error) {
    console.error("❌ AI Insights Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. GET /api/ai/predictions
// Dedicated Forecasts & Projections
// ==========================================
router.get("/predictions", async (req, res) => {
  try {
    const { metrics } = await getDetailedBusinessSnapshot(req.tenantId);
    const predictions = generatePredictiveForecasts(metrics);

    return res.status(200).json({
      success: true,
      data: predictions,
      predictions,
    });
  } catch (error) {
    console.error("❌ AI Predictions Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. GET /api/ai/recommendations
// Prioritized Action Plans
// ==========================================
router.get("/recommendations", async (req, res) => {
  try {
    const { metrics } = await getDetailedBusinessSnapshot(req.tenantId);
    const recommendations = generatePrioritizedRecommendations(metrics);

    return res.status(200).json({
      success: true,
      data: recommendations,
      recommendations,
    });
  } catch (error) {
    console.error("❌ AI Recommendations Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. POST /api/ai/chat
// Natural-Language Model-Powered AI Assistant with Tool Execution
// ==========================================
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Question query is required." });
    }

    const tenant = await Tenant.findById(req.tenantId);

    // 1. Identify which authoritative tools are needed
    const toolNames = identifyRequiredTools(message.trim());

    // 2. Execute tools securely on backend
    const toolData = await executeToolsForTenant(toolNames, req.tenantId);

    // 3. Delegate to Model Provider (Gemini / Ollama / Builtin)
    const result = await ModelProviderService.generateContextualAnswer({
      tenant,
      tenantId: req.tenantId,
      userQuery: message.trim(),
      toolData,
      conversationHistory,
    });

    return res.status(200).json({
      success: true,
      reply: result.text,
      message: result.text,
      provider: result.provider,
      toolsUsed: toolNames,
      notice: result.failureNotice,
    });
  } catch (error) {
    console.error("❌ AI Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
