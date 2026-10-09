import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ChevronRight, CheckCircle2, Clock, BarChart3, AlertOctagon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAIRecommendations } from "@/api/ai.api";

export default function Recommendations() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        setError("");
        const res = await fetchAIRecommendations(token);
        const list = res.recommendations || res.data || [];
        setItems(list);
      } catch (err) {
        setError(err.message || "Unable to fetch recommendations.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/ai" className="mb-2 block text-sm text-slate-400 hover:text-white">
          ← Back to AI Hub
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="text-amber-400" /> Prescriptive Action Plan
        </h1>
        <p className="mt-1 text-slate-400">
          Prioritized operational initiatives ranked by business impact, urgency, and estimated implementation effort.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          Synthesizing operational priorities...
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition shadow-lg"
            >
              <div className="space-y-3 flex-1">
                {/* Priority & Category Tag */}
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      item.priority === "Critical"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : item.priority === "High"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• {item.category}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white">{item.title}</h3>

                {/* Problem & Action */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Finding:</strong> {item.problem}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-indigo-400">Recommended Action:</strong> {item.suggestedAction}
                  </p>
                </div>

                {/* Expected Benefit & Verification Metric */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 size={14} />
                    <span>Benefit: {item.expectedBenefit}</span>
                  </div>
                  {item.measurement && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <BarChart3 size={14} className="text-indigo-400" />
                      <span>Metric: {item.measurement}</span>
                    </div>
                  )}
                  {item.effort && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={14} className="text-amber-400" />
                      <span>Effort: {item.effort}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
