import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Activity,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAIHealth, fetchAIInsights } from "@/api/ai.api";

const modules = [
  {
    title: "AI Chat",
    description: "Ask AI anything about your business.",
    path: "/ai/chat",
    icon: MessageSquare,
  },
  {
    title: "Business Health",
    description: "View overall business performance score.",
    path: "/ai/health",
    icon: Activity,
  },
  {
    title: "Insights",
    description: "Discover hidden business patterns.",
    path: "/ai/insights",
    icon: Lightbulb,
  },
  {
    title: "Predictions",
    description: "Forecast future business trends.",
    path: "/ai/predictions",
    icon: TrendingUp,
  },
  {
    title: "Recommendations",
    description: "Get AI powered suggestions.",
    path: "/ai/recommendations",
    icon: Brain,
  },
];

export default function AIHome() {
  const { token } = useAuth();
  const [health, setHealth] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const [healthRes, insightsRes] = await Promise.all([
          fetchAIHealth(token),
          fetchAIInsights(token),
        ]);

        setHealth(healthRes?.data || null);
        setInsights(insightsRes?.data?.insights || []);
      } catch (error) {
        console.error("AI home load error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const stats = [
    {
      title: "Business Health Score",
      value: `${health?.score ?? "--"}/100`,
      icon: Activity,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "AI Insights",
      value: `${insights.length || 0}`,
      icon: Lightbulb,
      color: "bg-amber-500/10 text-amber-400",
    },
    {
      title: "Predictions",
      value: `${health?.metrics ? Math.max(1, Math.round((health.metrics.totalRevenue || 0) / 10000)) : 0}`,
      icon: TrendingUp,
      color: "bg-indigo-500/10 text-indigo-400",
    },
    {
      title: "AI Queries",
      value: `${health?.metrics ? (health.metrics.totalCustomers || 0) + (health.metrics.totalAppointments || 0) : 0}`,
      icon: MessageSquare,
      color: "bg-sky-500/10 text-sky-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Business Analyst</h1>
        <p className="mt-1 text-slate-400">Your intelligent assistant for business decisions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className={`inline-flex rounded-xl p-3 ${item.color}`}>
                <Icon size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">
                {loading ? "..." : item.value}
              </h2>
              <p className="text-sm text-slate-400">{item.title}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">AI Tools</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {modules.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.title} to={item.path} className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500">
                <div className="flex justify-between">
                  <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                    <Icon size={22} />
                  </div>
                  <ArrowRight size={20} className="text-slate-500 group-hover:text-white" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
        <h2 className="text-xl font-semibold text-white">AI Summary</h2>
        <p className="mt-2 text-slate-300">
          {health?.summary || "Your business performance is being analyzed live from your latest workspace data."}
        </p>
      </div>
    </div>
  );
}