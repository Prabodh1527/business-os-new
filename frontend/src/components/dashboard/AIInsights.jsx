// frontend/src/components/dashboard/AIInsights.jsx
import { Brain, TrendingUp, Users, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AIInsights({ summary, isFresh }) {
  const insights = isFresh
    ? [
        {
          title: "Get Started with CRM",
          description: "Add your first set of customers to unlock retention analysis and booking trends.",
          icon: Users,
          color: "text-sky-400",
          link: "/crm/add",
        },
        {
          title: "Setup Inventory Catalog",
          description: "Define products and minimum stock limits to enable automated low-stock warnings.",
          icon: TrendingUp,
          color: "text-emerald-400",
          link: "/inventory/create",
        },
      ]
    : [
        {
          title: "Pending Collections",
          description: summary?.pendingInvoicesAmount > 0
            ? `You have ₹${summary.pendingInvoicesAmount.toLocaleString("en-IN")} pending collection across ${summary.pendingInvoicesCount} invoices.`
            : "All generated customer invoices are settled.",
          icon: TrendingUp,
          color: "text-amber-400",
          link: "/billing/invoices",
        },
        {
          title: "Customer Engagement",
          description: `${summary?.totalCustomers || 0} active customer profile(s) logged in your CRM workspace.`,
          icon: Users,
          color: "text-sky-400",
          link: "/crm",
        },
      ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2.5">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Insights</h2>
            <p className="text-xs text-slate-400">Workspace suggestions</p>
          </div>
        </div>

        <Link
          to="/ai/chat"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          Open AI
        </Link>
      </div>

      <div className="space-y-3">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 transition hover:border-indigo-500"
            >
              <div className="flex gap-3">
                <div className="rounded-lg bg-slate-800 p-2">
                  <Icon size={16} className={item.color} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                  <Link
                    to={item.link}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Action <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}