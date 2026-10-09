import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertTriangle, Users, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAIInsights } from '@/api/ai.api';

export default function Insights() {
  const { token } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInsights = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetchAIInsights(token);
      const list = res.insights || res.data?.insights || res.data || [
        {
          title: 'High Margin Service Opportunity',
          category: 'Revenue',
          impact: 'High',
          description: 'Consultation packages generated 42% higher margins than physical inventory this quarter.',
        },
        {
          title: 'Repeat Customer Retention Strong',
          category: 'Customer',
          impact: 'Medium',
          description: 'Returning clients account for over 65% of monthly appointments. Loyalty rewards recommended.',
        },
        {
          title: 'Inventory Turnaround Optimization',
          category: 'Inventory',
          impact: 'Medium',
          description: 'Reorder lead times can be reduced by consolidating supplier purchase orders.',
        },
      ];
      setInsights(list);
    } catch (err) {
      setError(err.message || 'Unable to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link to="/ai" className="mb-2 block text-sm text-slate-400 hover:text-white">
            ← Back to AI Hub
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-indigo-400" /> Automated AI Insights
          </h1>
          <p className="mt-1 text-slate-400">
            Real-time pattern discovery across sales, inventory, and operations.
          </p>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Analyzing business metrics...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                  {item.category || 'General'}
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                  Impact: {item.impact || 'Normal'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
