import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ArrowDown, ArrowUp, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchReportSummary } from '@/api/report.api';
import RevenueChart from '@/components/charts/RevenueChart';

export default function RevenueReport() {
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link to="/reports" className="mb-2 block text-sm text-slate-400 hover:text-white">
            ← Back to Reports
          </Link>
          <h1 className="text-3xl font-bold text-white">Revenue Analysis</h1>
          <p className="mt-1 text-slate-400">Periodic revenue flow and net performance.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Revenue Trajectory</h2>
        <div className="h-72 w-full">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}
