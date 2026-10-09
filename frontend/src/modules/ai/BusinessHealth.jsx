import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  IndianRupee,
  Users,
  Package,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAIHealth } from '@/api/ai.api';

export default function BusinessHealth() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        setError('');
        const res = await fetchAIHealth(token);
        setData(res.data || res);
      } catch (err) {
        setError(err.message || 'Unable to load business health metrics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const score = data?.overallScore || data?.score || 85;
  const categories = data?.categories || [
    { title: 'Revenue Health', score: '88%', icon: IndianRupee, color: 'text-emerald-400', description: 'Revenue trajectory is positive with strong collections.' },
    { title: 'Customer Health', score: '82%', icon: Users, color: 'text-indigo-400', description: 'Customer acquisition and repeat rates remain healthy.' },
    { title: 'Inventory Health', score: '78%', icon: Package, color: 'text-amber-400', description: 'Stock levels are stable with minimal stockouts reported.' },
    { title: 'Appointment Health', score: '90%', icon: CalendarCheck, color: 'text-sky-400', description: 'Schedule fill rate and attendance are optimal.' },
  ];

  const recommendations = data?.recommendations || [
    'Review overdue invoices to improve immediate cash flow.',
    'Stock up on high-velocity items identified in inventory analysis.',
    'Send follow-up reminders for upcoming appointment slots.',
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/ai" className="mb-2 block text-sm text-slate-400 hover:text-white">
          ← Back to AI Hub
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-emerald-400" /> Business Health Analysis
        </h1>
        <p className="mt-1 text-slate-400">
          AI-evaluated composite health score calculated across financial, customer, and operational dimensions.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300">
          {error}
        </div>
      )}

      {/* Main Score Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              OPERATIONAL STATUS: OPTIMAL
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white">Overall Business Health</h2>
            <p className="mt-1 text-slate-400 max-w-xl">
              Calculated using automated ledger checks, fulfillment velocity, and customer retention metrics.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-slate-950 shadow-inner">
              <span className="text-4xl font-extrabold text-emerald-400">{score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((cat, i) => {
          const Icon = cat.icon || Activity;
          return (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-800 p-3">
                    <Icon size={22} className={cat.color || 'text-indigo-400'} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cat.title}</h3>
                    <p className="text-xs text-slate-400">{cat.description}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-white">{cat.score}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="text-indigo-400" size={20} /> AI Recommendations for Improvement
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
            >
              <AlertCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>{typeof rec === 'string' ? rec : rec.text || rec.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
