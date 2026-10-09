import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Brain, Save, CheckCircle2, Key, Cpu, HelpCircle, Loader2 } from "lucide-react";
import API from "@/api/axios";

export default function AISettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    provider: "gemini",
    modelName: "gemini-1.5-flash",
    apiKey: "",
    ollamaUrl: "http://localhost:11434",
    enabled: true,
    recommendations: true,
  });

  useEffect(() => {
    async function loadTenantAI() {
      try {
        setLoading(true);
        const res = await API.get("/tenant/me");
        if (res.data?.success && res.data.data) {
          const tenant = res.data.data;
          if (tenant.aiConfig) {
            setConfig((prev) => ({
              ...prev,
              ...tenant.aiConfig,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load AI configuration:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTenantAI();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put("/tenant/me", {
        aiConfig: {
          provider: config.provider,
          modelName: config.modelName,
          apiKey: config.apiKey,
          ollamaUrl: config.ollamaUrl,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save AI configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/settings" className="mb-3 block text-sm text-slate-400 hover:text-white">
          ← Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Brain className="text-indigo-400" /> AI Assistant Engine Configuration
        </h1>
        <p className="mt-1 text-slate-400">
          Configure which language model provider powers your Business OS AI Analyst.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Provider Selection */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Model Provider</h2>
              <p className="text-sm text-slate-400">
                Choose between hosted free-tier models, local open-source inference, or the zero-cost built-in engine.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {[
              {
                id: "gemini",
                title: "Google Gemini Free Tier",
                desc: "Cloud inference via gemini-1.5-flash. Generous free tier quotas.",
                badge: "Recommended",
              },
              {
                id: "ollama",
                title: "Local Ollama Engine",
                desc: "Runs locally on your computer (llama3, mistral, qwen2.5) with ₹0 API cost.",
                badge: "Self-Hosted",
              },
              {
                id: "builtin",
                title: "Built-in Analyst Engine",
                desc: "Deterministic rule-based reasoning. Zero setup, 100% private, never fails.",
                badge: "Fallback",
              },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setConfig({ ...config, provider: p.id })}
                className={`cursor-pointer rounded-2xl border p-4 space-y-2 transition ${
                  config.provider === p.id
                    ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{p.title}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Specific Parameters */}
        {config.provider === "gemini" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key size={18} className="text-indigo-400" /> Gemini Free API Credentials
            </h3>
            <p className="text-xs text-slate-400">
              Get a free API key from Google AI Studio (aistudio.google.com). Free tier allows up to 15 RPM with zero cost.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Model Name</label>
                <select
                  name="modelName"
                  value={config.modelName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast, Low Latency, Free Tier)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning, Free Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Gemini API Key</label>
                <input
                  type="password"
                  name="apiKey"
                  value={config.apiKey}
                  onChange={handleChange}
                  placeholder="AIzaSy... (leave blank if set in backend .env)"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder-slate-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {config.provider === "ollama" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu size={18} className="text-indigo-400" /> Local Ollama Endpoint
            </h3>
            <p className="text-xs text-slate-400">
              Point to your local or network Ollama daemon running on your computer.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">Ollama Host URL</label>
                <input
                  type="text"
                  name="ollamaUrl"
                  value={config.ollamaUrl}
                  onChange={handleChange}
                  placeholder="http://localhost:11434"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Model Name</label>
                <input
                  type="text"
                  name="modelName"
                  value={config.modelName}
                  onChange={handleChange}
                  placeholder="llama3:latest"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Transparency Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex items-start gap-3">
          <HelpCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-white font-semibold">Automatic Zero-Downtime Fallback</p>
            <p>
              If your external provider quota expires, times out, or is offline, Business OS automatically switches to the built-in deterministic reasoning engine so your assistant never fails.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Saving Preferences..." : "Save AI Configuration"}</span>
          </button>
          {saved && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 size={16} /> AI configuration saved successfully.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}