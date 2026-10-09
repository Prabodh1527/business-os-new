import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  IndianRupee,
  Users,
  Package,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAIHealth } from "@/api/ai.api";

export default function BusinessHealth() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        setError("");
        const res = await fetchAIHealth(token);
        setData(res.data || res);
      } catch (err) {
        setError(err.message || "Unable to load business health metrics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const score = data?.overallScore || data?.score || 0;
  const status = data?.status || (score >= 80 ? "Optimal" : score >= 60 ? "Stable" : "Needs Attention");
  const pillars = data?.pillars || [];
  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/ai" className="mb-2 block text-sm text-slate-400 hover:text-white">
          ← Back to AI Hub
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-emerald-400" /> Business Health Analysis
        </h1>
        <p className="mt-1 text-slate-400">
          Transparent, deterministic multi-factor health index evaluated across 4 business pillars.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Score Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                score >= 80
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : score >= 60
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              OPERATIONAL STATUS: {status.toUpperCase()}
            </span>
            <h2 className="text-3xl font-bold text-white">Overall Composite Score</h2>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              {data?.summary ||
                "Evaluated using automated ledger checks, inventory fulfillment ratios, customer retention, and appointment throughput."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-slate-950 shadow-2xl">
              <span className="text-4xl font-extrabold text-white">
                {loading ? "..." : score}
                <span className="text-base font-normal text-slate-400">/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Transparent Assessment Pillars</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{pillar.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Weighted Contribution</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-400">{pillar.score}</span>
                  <p className="text-xs text-slate-500">{pillar.percent}% rating</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pillar.percent}%` }}
                />
              </div>

              {/* Contributing Factors */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluation Factors:</p>
                {(pillar.factors || []).map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot Reference Figures */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Info size={16} className="text-indigo-400" /> Ground-Truth Metric References
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/50">
            <span className="text-slate-400">Total Settled Revenue</span>
            <p className="mt-1 text-base font-bold text-white">
              ₹{(metrics.totalRevenue || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/50">
            <span className="text-slate-400">Pending Receivables</span>
            <p className="mt-1 text-base font-bold text-amber-400">
              ₹{(metrics.pendingRevenue || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/50">
            <span className="text-slate-400">Stock Catalog Value</span>
            <p className="mt-1 text-base font-bold text-teal-400">
              ₹{(metrics.totalStockValue || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/50">
            <span className="text-slate-400">Net Calculated Profit</span>
            <p className="mt-1 text-base font-bold text-emerald-400">
              ₹{(metrics.netProfit || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
