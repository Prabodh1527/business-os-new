// frontend/src/modules/dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  Brain,
  IndianRupee,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardAnalytics } from "@/api/analytics.api";
import API from "@/api/axios";

import RevenueChart from "@/components/charts/RevenueChart";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import RecentActivity from "@/components/dashboard/RecentActivity";
import BusinessHealthCard from "@/components/dashboard/BusinessHealthCard";
import AIInsights from "@/components/dashboard/AIInsights";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";

export default function Dashboard() {
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  const [analytics, setAnalytics] = useState({
    summary: {
      totalRevenue: 0,
      pendingInvoicesAmount: 0,
      pendingInvoicesCount: 0,
      totalCustomers: 0,
      lowStockCount: 0,
    },
    lowStockItems: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        if (!token) return;

        const [analyticsResponse, tenantResponse] =
          await Promise.all([
            fetchDashboardAnalytics(token),
            API.get("/tenant/me"),
          ]);

        if (isMounted) {
          if (analyticsResponse.success) {
            setAnalytics(analyticsResponse.data);
          }

          if (tenantResponse.data?.success) {
            setBusiness(tenantResponse.data.data);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const { summary, lowStockItems } = analytics;

  const isFreshWorkspace =
    summary.totalRevenue === 0 &&
    summary.totalCustomers === 0 &&
    summary.lowStockCount === 0;

  const businessName =
    business?.companyName ||
    "Your Business";

  const stats = [
    {
      title: "Collected Revenue",
      value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`,
      change: summary.totalRevenue > 0 ? "Live" : "No sales yet",
      icon: IndianRupee,
    },
    {
      title: "Total Customers",
      value: summary.totalCustomers.toString(),
      change:
        summary.totalCustomers > 0
          ? "Active"
          : "0 customers",
      icon: Users,
    },
    {
      title: "Pending Invoices",
      value: `₹${summary.pendingInvoicesAmount.toLocaleString(
        "en-IN"
      )}`,
      change: `${summary.pendingInvoicesCount} unpaid`,
      icon: Clock,
    },
    {
      title: "Low Stock Alerts",
      value: summary.lowStockCount.toString(),
      change:
        summary.lowStockCount > 0
          ? "Restock needed"
          : "Healthy",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-5">

      {/* HERO */}
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="max-w-3xl">

            <p className="text-sm text-slate-400">
              Welcome back, {user?.name || "Owner"} 👋
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              {loading ? "Loading..." : businessName}
            </h1>

            <p className="mt-2 text-sm font-medium text-indigo-400">
              Business Dashboard
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isFreshWorkspace
                ? `Your ${businessName} workspace is active. Create your first invoice or add customers to see real-time performance analytics.`
                : `Tracking ${summary.totalCustomers} customers and ₹${summary.totalRevenue.toLocaleString(
                    "en-IN"
                  )} in settled revenue.`}
            </p>

          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-8 py-5 text-center">
            <Brain
              size={28}
              className="mx-auto text-indigo-400"
            />

            <h2 className="mt-3 text-4xl font-bold text-white">
              {isFreshWorkspace ? "—" : "85"}
            </h2>

            <p className="text-xs text-slate-400">
              Health Score
            </p>
          </div>
        </div>
      </section>

      {/* KPI STATS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-indigo-500"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-slate-800 p-2.5">
                  <Icon
                    size={20}
                    className="text-indigo-400"
                  />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  {item.change}
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-white">
                {loading ? "..." : item.value}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {item.title}
              </p>
            </div>
          );
        })}
      </section>

      {/* CHART & NOTIFICATIONS */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart
            totalRevenue={summary.totalRevenue}
          />
        </div>

        <NotificationPanel
          lowStockCount={summary.lowStockCount}
        />
      </section>

      {/* AI & HEALTH */}
      <section className="grid gap-4 xl:grid-cols-2">
        <BusinessHealthCard
          summary={summary}
          isFresh={isFreshWorkspace}
        />

        <AIInsights
          summary={summary}
          isFresh={isFreshWorkspace}
        />
      </section>

      {/* BOTTOM */}
      <section className="grid gap-4 xl:grid-cols-2">
        <RecentActivity />

        <InventoryAlerts
          items={lowStockItems}
        />
      </section>

    </div>
  );
}