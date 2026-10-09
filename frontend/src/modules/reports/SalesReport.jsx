import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchReportSummary } from '@/api/report.api';
import SalesChart from '@/components/charts/SalesChart';

export default function SalesReport() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetchReportSummary(token);
        setData(res.data || res);
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
        <Link to="/reports" className="mb-2 block text-sm text-slate-400 hover:text-white">
          ← Back to Reports
        </Link>
        <h1 className="text-3xl font-bold text-white">Sales & Invoicing Report</h1>
        <p className="mt-1 text-slate-400">Invoice creation and transaction volumes.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Sales Volume Breakdown</h2>
        <div className="h-72 w-full">
          <SalesChart />
        </div>
      </div>
    </div>
  );
}
