import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function InventoryChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { category: "Hair Care", inStock: 35, lowStock: 4 },
    { category: "Skin Care", inStock: 28, lowStock: 2 },
    { category: "Cosmetics", inStock: 42, lowStock: 6 },
    { category: "Equipment", inStock: 12, lowStock: 1 },
    { category: "General", inStock: 19, lowStock: 3 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Inventory By Category</h2>
          <p className="mt-1 text-xs text-slate-400">Stock distribution across categories</p>
        </div>
        <div className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          Catalog
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
            <Bar dataKey="inStock" fill="#6366f1" radius={[4, 4, 0, 0]} name="In Stock" />
            <Bar dataKey="lowStock" fill="#ef4444" radius={[4, 4, 0, 0]} name="Low Stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
