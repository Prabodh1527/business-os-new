// frontend/src/components/charts/RevenueChart.jsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function RevenueChart({ totalRevenue = 0, chartData = [] }) {
  const hasData = totalRevenue > 0 && chartData.length > 0;

  // Fallback empty baseline
  const data = hasData
    ? chartData
    : [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 },
        { month: "Mar", revenue: 0 },
        { month: "Apr", revenue: 0 },
        { month: "May", revenue: 0 },
        { month: "Jun", revenue: 0 },
        { month: "Jul", revenue: 0 },
      ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Revenue Analytics</h2>
          <p className="mt-1 text-xs text-slate-400">
            {hasData ? "Monthly revenue performance" : "No billing history recorded yet"}
          </p>
        </div>

        <div className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          {hasData ? "+ Live Data" : "Baseline"}
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 text-center">
          <TrendingUp className="mb-2 text-slate-600" size={32} />
          <p className="text-sm font-medium text-slate-400">No revenue data available</p>
          <p className="text-xs text-slate-500">Invoices created will plot monthly totals here</p>
        </div>
      ) : (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}