import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchReportSummary } from '@/api/report.api';
import AttendanceChart from '@/components/charts/AttendanceChart';

export default function EmployeeReport() {
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
        <h1 className="text-3xl font-bold text-white">Workforce & Attendance Report</h1>
        <p className="mt-1 text-slate-400">Employee presence, payroll burden, and capacity utilization.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Weekly Attendance Distribution</h2>
        <div className="h-72 w-full">
          <AttendanceChart />
        </div>
      </div>
    </div>
  );
}
