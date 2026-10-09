import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function SalesChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { day: "Mon", sales: 12000 },
    { day: "Tue", sales: 19000 },
    { day: "Wed", sales: 15000 },
    { day: "Thu", sales: 24000 },
    { day: "Fri", sales: 32000 },
    { day: "Sat", sales: 41000 },
    { day: "Sun", sales: 28000 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Daily Sales Velocity</h2>
          <p className="mt-1 text-xs text-slate-400">Revenue per day of the week</p>
        </div>
        <div className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          Sales
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
            <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
