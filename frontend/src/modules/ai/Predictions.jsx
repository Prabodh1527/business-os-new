import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowUpRight, ShieldCheck, HelpCircle, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAIPredictions } from "@/api/ai.api";

export default function Predictions() {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        setError("");
        const res = await fetchAIPredictions(token);
        const data = res.predictions || res.data || [];
        setPredictions(data);
      } catch (err) {
        setError(err.message || "Unable to fetch forecasts.");
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
          <TrendingUp className="text-sky-400" /> AI Predictive Forecasts
        </h1>
        <p className="mt-1 text-slate-400">
          Statistical models with transparent uncertainty bands, data-sufficiency validation, and method disclosures.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          Running time-series projection algorithms...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {predictions.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">{p.metric}</span>
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-emerald-400 font-semibold">
                    Confidence: {p.confidence}
                  </span>
                </div>

                <div className="text-2xl font-bold text-white flex items-baseline gap-2 pt-1">
                  {p.projection}
                </div>

                {p.uncertaintyRange && (
                  <div className="rounded-xl bg-slate-800/80 p-2.5 text-xs text-slate-400 border border-slate-700/50">
                    <span className="text-slate-500 block mb-0.5">Uncertainty Horizon:</span>
                    <span className="text-white font-mono">{p.uncertaintyRange}</span>
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
              </div>

              {p.method && (
                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-400 shrink-0" />
                  <span>Method: {p.method}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Methodology Disclaimer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex items-start gap-2.5">
        <HelpCircle size={16} className="text-indigo-400 mt-0.5 shrink-0" />
        <span>
          <strong>Forecast Transparency:</strong> Projections represent statistical extrapolations based on historical settled invoices and scheduled appointments. They are probabilistic estimations designed to assist planning, not guaranteed operational outcomes.
        </span>
      </div>
    </div>
  );
}
