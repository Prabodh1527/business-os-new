import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

export default function RevenueCard() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-6 transition-all duration-300 hover:border-emerald-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Today's Revenue
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            ₹48,750
          </h2>

          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp size={16} />
            <span>+18.4% from yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-500/15 p-4">
          <DollarSign
            size={26}
            className="text-emerald-400"
          />
        </div>
      </div>

      <div className="my-8 h-px bg-slate-800" />

      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Transactions
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            126
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Avg. Order
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            ₹387
          </p>
        </div>
      </div>

      <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 font-medium text-white transition hover:bg-emerald-400">
        View Revenue Report
        <ArrowUpRight size={18} />
      </button>
    </div>
  );
}