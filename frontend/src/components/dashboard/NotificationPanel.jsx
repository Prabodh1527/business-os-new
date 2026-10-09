// frontend/src/components/dashboard/NotificationPanel.jsx
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationPanel({ lowStockCount = 0 }) {
  const notifications = [];

  if (lowStockCount > 0) {
    notifications.push({
      title: `${lowStockCount} items running low on stock`,
      time: "Action required",
      icon: AlertTriangle,
      color: "text-amber-400",
      link: "/inventory",
    });
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-400">
          {notifications.length} New
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center text-center">
          <CheckCircle2 size={32} className="mb-2 text-emerald-500/50" />
          <p className="text-sm font-medium text-slate-300">All caught up</p>
          <p className="text-xs text-slate-500">No urgent alerts or pending tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                to={item.link || "#"}
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3 transition hover:border-indigo-500"
              >
                <div className="rounded-lg bg-slate-800 p-2.5">
                  <Icon size={16} className={item.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{item.time}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}