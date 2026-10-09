// frontend/src/components/dashboard/RecentActivity.jsx
import { Clock3 } from "lucide-react";

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 text-center">
          <Clock3 className="mb-2 text-slate-600" size={28} />
          <p className="text-sm font-medium text-slate-400">No recent activity</p>
          <p className="text-xs text-slate-500">Invoices, bookings, and customer updates will log here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3"
              >
                <div className="rounded-lg bg-slate-800 p-2">
                  <Icon size={16} className={item.color} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{item.subtitle}</p>
                </div>
                <span className="text-[11px] whitespace-nowrap text-slate-500">{item.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}