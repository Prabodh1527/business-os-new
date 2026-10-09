import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Clock } from "lucide-react";

export default function AttendanceChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { day: "Mon", present: 0, late: 0, absent: 0 },
    { day: "Tue", present: 0, late: 0, absent: 0 },
    { day: "Wed", present: 0, late: 0, absent: 0 },
    { day: "Thu", present: 0, late: 0, absent: 0 },
    { day: "Fri", present: 0, late: 0, absent: 0 },
    { day: "Sat", present: 0, late: 0, absent: 0 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Attendance Weekly Trends</h2>
          <p className="mt-1 text-xs text-slate-400">Daily staff presence and punctuality</p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          Staff Log
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
            <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
            <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
