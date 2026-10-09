import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, AlertTriangle, RefreshCw, ArrowUpRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAIInsights } from "@/api/ai.api";

export default function Insights() {
  const { token } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetchAIInsights(token);
      const list = res.insights || res.data?.insights || [];
      setInsights(list);
    } catch (err) {
      setError(err.message || "Unable to fetch automated insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link to="/ai" className="mb-2 block text-sm text-slate-400 hover:text-white">
            ← Back to AI Hub
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-indigo-400" /> Evidence-Backed Business Insights
          </h1>
          <p className="mt-1 text-slate-400">
            Automated anomaly detection across revenue, stock velocity, receivables, and staff logs.
          </p>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Insights
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          Correlating multi-module ledger figures and fulfillment ratios...
        </div>
      ) : insights.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          No anomalies detected. Operations are functioning within normal bounds.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 hover:border-slate-700 transition shadow-lg"
            >
              {/* Category & Urgency */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                  {item.category || "General"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.urgency === "High"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : item.urgency === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {item.urgency} Impact
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white">{item.title}</h3>

              {/* What was observed */}
              <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60 text-xs space-y-1.5">
                <p className="font-semibold text-slate-300">Observation:</p>
                <p className="text-slate-400 leading-relaxed">{item.observed}</p>
                {item.comparison && (
                  <p className="text-indigo-400 font-medium pt-1">
                    Context: {item.comparison}
                  </p>
                )}
              </div>

              {/* Why it matters */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-300">Why It Matters:</span>
                <p className="text-slate-400 leading-relaxed">{item.whyItMatters}</p>
              </div>

              {/* Recommended Action */}
              <div className="border-t border-slate-800 pt-3 flex items-start gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">Action:</strong> {item.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
