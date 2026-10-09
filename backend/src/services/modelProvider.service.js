import { generateAnalystResponse } from "./analystChat.service.js";
import {
  getDetailedBusinessSnapshot,
  calculateBusinessHealth,
  generateEvidenceBackedInsights,
  generatePredictiveForecasts,
  generatePrioritizedRecommendations,
} from "./businessAnalyst.service.js";

/**
 * Reusable Language Model Provider Architecture.
 * Supports:
 *  1. Google Gemini Free Tier (API key in env or tenant config)
 *  2. Local Ollama (e.g., llama3, mistral, qwen2.5 on localhost:11434)
 *  3. Builtin Deterministic Reasoning Engine (Offline fallback, 100% reliable, zero token cost)
 */
export class ModelProviderService {
  /**
   * Calls Google Gemini API (Free Tier compatible: gemini-1.5-flash / gemini-1.5-pro)
   */
  static async callGemini({ apiKey, modelName = "gemini-1.5-flash", prompt, conversationHistory = [] }) {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    const contents = [];

    // Map conversation history
    conversationHistory.forEach((msg) => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || msg.text || "" }],
      });
    });

    // Add current query prompt with tool data injected
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const body = {
      contents,
      generationConfig: {
        temperature: 0.2, // Low temperature for factual precision
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("QUOTA_EXHAUSTED");
        }
        throw new Error(errorBody?.error?.message || `Gemini API returned status ${response.status}`);
      }

      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("Empty candidate response returned by model.");
      return text;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  /**
   * Calls local Ollama inference service if running on machine
   */
  static async callOllama({ ollamaUrl = "http://localhost:11434", modelName = "llama3:latest", prompt, conversationHistory = [] }) {
    const url = `${ollamaUrl}/api/chat`;

    const messages = conversationHistory.map((m) => ({
      role: m.role || "user",
      content: m.content || m.text || "",
    }));

    messages.push({ role: "user", content: prompt });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: false,
          options: { temperature: 0.3 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`Ollama returned status ${response.status}`);
      const data = await response.json();
      return data?.message?.content || "";
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  /**
   * Dispatches the query through the active model provider with automatic graceful fallback.
   */
  static async generateContextualAnswer({
    tenant,
    tenantId,
    userQuery,
    toolData,
    conversationHistory = [],
  }) {
    const aiConfig = tenant?.aiConfig || {};
    const preferredProvider = aiConfig.provider || (process.env.GEMINI_API_KEY ? "gemini" : "builtin");

    // Construct the grounding prompt with verified tool outputs
    const groundingPrompt = `
You are an expert AI Business Analyst embedded within the user's Business OS.
You have direct, verified access to their live database tools.

CURRENT VERIFIED BUSINESS DATA (Ground Truth from Backend Tools):
${JSON.stringify(toolData, null, 2)}

USER QUESTION:
"${userQuery}"

INSTRUCTIONS:
1. Answer in natural language directly addressing the question using the verified data provided above.
2. Structure your response with clean Markdown (headings, bullet points, and bold figures).
3. Do not invent any numbers, percentages, or records that are not in the verified data.
4. If a calculation is requested, explain the findings and offer actionable, practical next steps.
5. If data is missing or zero, explain that clearly without guessing.
`;

    let modelAnswer = "";
    let providerUsed = "builtin";
    let failureNotice = null;

    // 1. Try Gemini if configured or env key exists
    if (preferredProvider === "gemini" || process.env.GEMINI_API_KEY) {
      try {
        modelAnswer = await this.callGemini({
          apiKey: aiConfig.apiKey,
          modelName: aiConfig.modelName || "gemini-1.5-flash",
          prompt: groundingPrompt,
          conversationHistory,
        });
        providerUsed = "gemini";
      } catch (err) {
        console.warn("⚠️ Gemini invocation failed/unavailable:", err.message);
        if (err.message === "QUOTA_EXHAUSTED") {
          failureNotice = "Gemini free-tier quota reached. Seamlessly switched to Built-in Engine.";
        }
      }
    }

    // 2. Try Ollama if preferred or Gemini was absent
    if (!modelAnswer && (preferredProvider === "ollama" || aiConfig.ollamaUrl)) {
      try {
        modelAnswer = await this.callOllama({
          ollamaUrl: aiConfig.ollamaUrl || "http://localhost:11434",
          modelName: aiConfig.modelName || "llama3",
          prompt: groundingPrompt,
          conversationHistory,
        });
        providerUsed = "ollama";
      } catch (err) {
        console.warn("⚠️ Local Ollama service not responding:", err.message);
      }
    }

    // 3. Guaranteed Fallback: Builtin Deterministic Engine
    if (!modelAnswer) {
      const { metrics } = await getDetailedBusinessSnapshot(tenantId);
      const health = calculateBusinessHealth(metrics);
      const insights = generateEvidenceBackedInsights(metrics);
      const predictions = generatePredictiveForecasts(metrics);
      const recommendations = generatePrioritizedRecommendations(metrics);

      modelAnswer = generateAnalystResponse(userQuery, {
        metrics,
        health,
        insights,
        predictions,
        recommendations,
      });
      providerUsed = "builtin";
    }

    return {
      text: modelAnswer,
      provider: providerUsed,
      failureNotice,
    };
  }
}
