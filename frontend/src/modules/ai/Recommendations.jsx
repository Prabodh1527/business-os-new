import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Zap, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAIHealth } from '@/api/ai.api';

export default function Recommendations() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetchAIHealth(token);
        const list = res.recommendations || [
          {
            title: 'Automate Invoice Reminders',
            category: 'Finance',
            benefit: 'Shorten payment cycle by ~4 days',
            priority: 'High',
            action: 'Configure automated WhatsApp/Email reminders for pending invoices.',
          },
          {
            title: 'Supplier Volume Consolidation',
            category: 'Procurement',
            benefit: 'Save ~8-12% on wholesale purchase orders',
            priority: 'Medium',
            action: 'Consolidate multiple vendor purchase orders into monthly bulk requisitions.',
          },
          {
            title: 'Peak-Hour Staffing Rebalancing',
            category: 'Human Resources',
            benefit: 'Improve appointment customer satisfaction',
            priority: 'Medium',
            action: 'Align stylist/specialist shifts with peak weekend and evening hours.',
          },
        ];
        setItems(list);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/ai" className="mb-2 block text-sm text-slate-400 hover:text-white">
          ← Back to AI Hub
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="text-amber-400" /> Prescriptive Action Plan
        </h1>
        <p className="mt-1 text-slate-400">
          Prioritized operational improvements generated to maximize profit and efficiency.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-400">
                  {item.priority} Priority
                </span>
                <span className="text-xs text-slate-500">{item.category}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.action}</p>
              <p className="text-xs font-medium text-emerald-400">Expected Impact: {item.benefit}</p>
            </div>
            <button className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">
              Implement <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
