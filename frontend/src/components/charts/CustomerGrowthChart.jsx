import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users } from "lucide-react";

export default function CustomerGrowthChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { month: "Jan", customers: 12 },
    { month: "Feb", customers: 18 },
    { month: "Mar", customers: 29 },
    { month: "Apr", customers: 41 },
    { month: "May", customers: 58 },
    { month: "Jun", customers: 74 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Customer Acquisition</h2>
          <p className="mt-1 text-xs text-slate-400">Total client base progression</p>
        </div>
        <div className="rounded-lg bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
          CRM Growth
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="customerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
            <Area type="monotone" dataKey="customers" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#customerGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
