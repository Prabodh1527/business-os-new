import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function ProfitChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { month: "Jan", revenue: 45000, expenses: 20000, profit: 25000 },
    { month: "Feb", revenue: 58000, expenses: 24000, profit: 34000 },
    { month: "Mar", revenue: 72000, expenses: 29000, profit: 43000 },
    { month: "Apr", revenue: 86000, expenses: 31000, profit: 55000 },
    { month: "May", revenue: 94000, expenses: 35000, profit: 59000 },
    { month: "Jun", revenue: 112000, expenses: 39000, profit: 73000 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Profit & Margins</h2>
          <p className="mt-1 text-xs text-slate-400">Net profit vs operational expenses</p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          Financials
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#profitGrad)" name="Net Profit" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={0} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
