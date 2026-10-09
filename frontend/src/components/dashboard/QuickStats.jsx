import {
  TrendingUp,
  Wallet,
  Users,
  CalendarDays,
} from "lucide-react";

const stats = [
  {
    label: "Monthly Growth",
    value: "+18.6%",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    label: "Cash Flow",
    value: "₹3.8L",
    icon: Wallet,
    color: "text-indigo-400",
  },
  {
    label: "New Customers",
    value: "142",
    icon: Users,
    color: "text-sky-400",
  },
  {
    label: "Appointments",
    value: "324",
    icon: CalendarDays,
    color: "text-amber-400",
  },
];

export default function QuickStats() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Quick Stats
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 transition-all duration-300 hover:border-indigo-500 hover:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={item.color}
                  size={22}
                />

                <span className="text-2xl font-bold text-white">
                  {item.value}
                </span>
              </div>

              <p className="mt-5 text-sm text-slate-400">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}