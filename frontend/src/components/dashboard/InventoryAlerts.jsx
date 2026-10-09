// frontend/src/components/dashboard/InventoryAlerts.jsx
import { AlertTriangle, Package, PackageCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function InventoryAlerts({ items = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Inventory Alerts</h2>
          <p className="mt-1 text-xs text-slate-400">Products requiring restock</p>
        </div>

        <div className="rounded-lg bg-red-500/10 p-2.5">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 text-center">
          <PackageCheck className="mb-2 text-emerald-500/60" size={28} />
          <p className="text-sm font-medium text-slate-300">Stock levels healthy</p>
          <p className="text-xs text-slate-500">No items are currently at or below minimum threshold</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item._id || item.sku}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3 transition hover:border-red-500"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-800 p-2">
                  <Package size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400">SKU: {item.sku || "N/A"}</p>
                </div>
              </div>

              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                {item.quantity ?? item.stockQuantity ?? 0} left
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/inventory"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Manage Inventory
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}