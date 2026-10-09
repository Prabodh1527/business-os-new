import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  Users,
  Package,
  CalendarDays,
  ArrowRight,
  FileText,
  BarChart3,
  Receipt,
  Download,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchReportSummary } from '@/api/report.api';

export default function Reports() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        setError('');
        const res = await fetchReportSummary(token);
        setData(res.data || res);
      } catch (err) {
        setError(err.message || 'Unable to load report summary');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${Number(data?.revenue?.totalRevenue ?? data?.revenue ?? 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Total Expenses',
      value: `₹${Number(data?.expenses?.totalExpenses ?? data?.expenses ?? 0).toLocaleString('en-IN')}`,
      icon: Receipt,
      color: 'bg-rose-500/10 text-rose-400',
    },
    {
      title: 'Active Customers',
      value: data?.customers?.activeCount ?? data?.customers?.totalCustomers ?? data?.customersCount ?? 0,
      icon: Users,
      color: 'bg-sky-500/10 text-sky-400',
    },
    {
      title: 'Inventory SKUs',
      value: data?.inventory?.totalProducts ?? data?.productsCount ?? 0,
      icon: Package,
      color: 'bg-purple-500/10 text-purple-400',
    },
  ];

  const reportModules = [
    {
      title: 'Revenue Analytics',
      desc: 'In-depth collection breakdowns, historical comparisons, and overdue aging.',
      link: '/reports/revenue',
      icon: IndianRupee,
    },
    {
      title: 'Sales & Invoices',
      desc: 'Invoice settlement status, average basket value, and top payment channels.',
      link: '/reports/sales',
      icon: BarChart3,
    },
    {
      title: 'Employee & Attendance',
      desc: 'Staff hours, leave usage, payroll disbursements, and productivity metrics.',
      link: '/reports/employees',
      icon: Users,
    },
    {
      title: 'Inventory Valuation',
      desc: 'Stock turn velocity, holding values, reorder thresholds, and shrinkage.',
      link: '/reports/inventory',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Intelligence Reports</h1>
          <p className="mt-1 text-slate-400">
            Real-time financial, operational, and organizational reporting.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className={`inline-flex rounded-xl p-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">
                {loading ? '…' : s.value}
              </h2>
              <p className="text-sm text-slate-400">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Reports Nav */}
      <h2 className="text-xl font-semibold text-white mt-8">Explore Specialized Reports</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {reportModules.map((rep, i) => {
          const Icon = rep.icon;
          return (
            <Link
              key={i}
              to={rep.link}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-indigo-500/50 hover:bg-slate-850"
            >
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-slate-800 p-3 text-indigo-400">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400">
                  {rep.title}
                </h3>
                <p className="text-sm text-slate-400">{rep.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-400">
                View Report <ArrowRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
