import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Check, Zap, Calendar, Users, Briefcase, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchCustomers } from "@/api/customer.api";
import { fetchEmployees } from "@/api/employees.api";

const plans = [
  {
    name: "Starter",
    price: "₹999/month",
    features: ["Customer CRM", "Appointments", "Basic Reports", "Single Branch"],
  },
  {
    name: "Professional",
    price: "₹2499/month",
    features: [
      "Everything in Starter",
      "AI Business Analyst",
      "Employee & Attendance OS",
      "Payroll & Direct Payslips",
      "Advanced Reports",
    ],
  },
  {
    name: "Enterprise",
    price: "₹4999/month",
    features: [
      "Everything in Professional",
      "Multi-Tenant Branches",
      "Custom Webhooks & Integrations",
      "Unlimited Staff & Clients",
      "Priority SLA Support",
    ],
  },
];

const history = [
  {
    date: "01 July 2026",
    amount: "₹2499",
    status: "Paid",
  },
  {
    date: "01 June 2026",
    amount: "₹2499",
    status: "Paid",
  },
];

export default function Subscription() {
  const { token } = useAuth();
  const [plan, setPlan] = useState("Professional");
  const [message, setMessage] = useState("");
  const [counts, setCounts] = useState({
    customers: 0,
    employees: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadUsage() {
      if (!token) return;
      try {
        const [cRes, eRes] = await Promise.all([
          fetchCustomers(token).catch(() => ({ customers: [] })),
          fetchEmployees(token).catch(() => ({ employees: [] })),
        ]);
        const custCount = cRes.customers?.length ?? cRes.data?.length ?? 0;
        const empCount = eRes.employees?.length ?? eRes.data?.length ?? 0;
        setCounts({
          customers: custCount,
          employees: empCount,
          loading: false,
        });
      } catch (e) {
        setCounts((prev) => ({ ...prev, loading: false }));
      }
    }
    loadUsage();
  }, [token]);

  const upgrade = (selected) => {
    setPlan(selected);
    setMessage(`${selected} plan activated.`);
    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/settings" className="mb-3 block text-sm text-slate-400 hover:text-white">
          ← Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-white">Subscription & Plan</h1>
        <p className="mt-1 text-slate-400">
          Manage your Business OS subscription, tenant resource quotas, and billing records.
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-3 text-white">
            <Zap size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-300">Active Tier</p>
            <h2 className="text-2xl font-bold text-white">{plan} Plan</h2>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="mb-5 text-xl font-semibold text-white">Available Plans</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((item) => (
            <div
              key={item.name}
              className={`rounded-2xl border p-6 ${
                plan === item.name ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900"
              }`}
            >
              <h3 className="text-xl font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-2xl font-bold text-white">{item.price}</p>
              <div className="mt-5 space-y-3">
                {item.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={16} className="text-emerald-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={() => upgrade(item.name)}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 cursor-pointer"
              >
                {plan === item.name ? "Current Plan" : "Upgrade Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Dynamic Resource Usage */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold text-white">Live Workspace Usage</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm">Registered Customers</span>
              <Users size={16} className="text-indigo-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {counts.loading ? "..." : counts.customers} <span className="text-xs text-slate-400 font-normal">/ 5,000 capacity</span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm">Active Workforce</span>
              <Briefcase size={16} className="text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {counts.loading ? "..." : counts.employees} <span className="text-xs text-slate-400 font-normal">/ 100 capacity</span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm">System Health</span>
              <Activity size={16} className="text-teal-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-400">
              100% <span className="text-xs text-slate-400 font-normal">Operational</span>
            </p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Billing History</h2>
        </div>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.date} className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <p className="text-white text-sm font-medium">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-bold">{item.amount}</p>
                <p className="text-xs font-semibold text-emerald-400">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}
    </div>
  );
}