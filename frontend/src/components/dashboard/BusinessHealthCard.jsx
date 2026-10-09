// frontend/src/components/dashboard/BusinessHealthCard.jsx
import { Activity, ArrowUpRight, TrendingUp, ShieldCheck, CircleDollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function BusinessHealthCard({ summary, isFresh }) {
  const score = isFresh ? 0 : Math.min(100, Math.round(50 + (summary?.totalRevenue > 0 ? 30 : 0) + (summary?.totalCustomers > 0 ? 15 : 0) - (summary?.lowStockCount > 0 ? 10 : 0)));

  const metrics = [
    {
      title: "Revenue Flow",
      value: summary?.totalRevenue > 0 ? `₹${summary.totalRevenue.toLocaleString("en-IN")}` : "No Transactions",
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      title: "Customer Base",
      value: summary?.totalCustomers > 0 ? `${summary.totalCustomers} Recorded` : "Empty",
      icon: ShieldCheck,
      color: "text-sky-400",
    },
    {
      title: "Stock Status",
      value: summary?.lowStockCount > 0 ? `${summary.lowStockCount} Low` : "Optimal",
      icon: CircleDollarSign,
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Business Health</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Overall Score</h2>
        </div>
        <div className="rounded-xl bg-indigo-600/20 p-2.5">
          <Activity size={20} className="text-indigo-400" />
        </div>
      </div>

      <div className="my-6 flex justify-center">
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-indigo-500/80">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">{isFresh ? "—" : score}</h1>
            <p className="text-xs text-slate-400">{isFresh ? "No Data" : "/100"}</p>
          </div>
          {!isFresh && (
            <div className="absolute -right-1 -top-1 rounded-full bg-emerald-500 p-1.5">
              <ArrowUpRight size={14} className="text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-800 p-2">
                  <Icon size={16} className={item.color} />
                </div>
                <span className="text-sm text-slate-300">{item.title}</span>
              </div>
              <span className="text-sm font-semibold text-white">{item.value}</span>
            </div>
          );
        })}
      </div>

      <Link
        to="/ai/health"
        className="mt-5 block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        View Full Health Analysis
      </Link>
    </div>
  );
}