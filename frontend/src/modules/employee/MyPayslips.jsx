import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Eye, FileText, Printer, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchPayroll } from "@/api/payroll.api";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(Number(amount || 0));

export default function MyPayslips() {
  const { user, token } = useAuth();
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const loadPayroll = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const response = await fetchPayroll(token);
      setPayroll(response.payroll || response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load payslips.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  const latest = payroll[0];
  const totalNet = payroll.reduce((sum, item) => sum + Number(item.net || 0), 0);
  const totalPaid = payroll.filter((item) => item.status === "Paid").reduce((sum, item) => sum + Number(item.net || 0), 0);
  const totalDeductions = payroll.reduce((sum, item) => sum + Number(item.deduction || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">My Payslips & Compensation</h1>
        <p className="mt-1 text-sm text-slate-400">Payroll records issued by your business owner.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Latest Net Pay", latest ? formatCurrency(latest.net) : "—", "text-emerald-400"],
          ["Base Salary", latest ? formatCurrency(latest.salary) : "—", "text-white"],
          ["Bonus", latest ? formatCurrency(latest.bonus) : "—", "text-indigo-400"],
          ["Total Deductions", formatCurrency(totalDeductions), "text-rose-400"],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <h2 className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{loading ? "…" : value}</h2>
            <p className="mt-1 text-xs text-slate-400">{label === "Latest Net Pay" ? latest?.month || "No payroll issued" : `${payroll.length} payroll record${payroll.length === 1 ? "" : "s"}`}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex items-center gap-3 text-white"><FileText size={20} className="text-emerald-400" /><div><h2 className="text-lg font-semibold">Salary Statements</h2><p className="text-xs text-slate-400">Payroll statements made available to your employee account.</p></div></div>
        {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading payroll records…</p> : payroll.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No payslips have been issued yet.</p> : (
          <div className="space-y-3">
            {payroll.map((item) => (
              <div key={item._id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-emerald-400"><BadgeCheck size={20} /></div>
                  <div><h3 className="text-base font-semibold text-white">{item.month}</h3><p className="mt-0.5 text-xs text-slate-400">Net Pay: <span className="font-semibold text-emerald-400">{formatCurrency(item.net)}</span> • {item.status}</p></div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.status === "Paid" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>{item.status}</span>
                  <button onClick={() => setSelectedPayslip(item)} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"><Eye size={14} />View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && payroll.length > 0 && <p className="mt-4 text-xs text-slate-500">Lifetime net pay recorded: {formatCurrency(totalNet)} · paid: {formatCurrency(totalPaid)}</p>}
      </div>

      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div><span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Payroll Statement</span><h3 className="mt-1 text-xl font-bold text-white">{selectedPayslip.month}</h3><p className="text-xs text-slate-400">{user?.name || "Employee"} · {user?.employeeId || ""} · {user?.department || ""}</p></div>
              <button onClick={() => setSelectedPayslip(null)} className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
              <div className="flex justify-between text-slate-300"><span>Base Salary</span><span>{formatCurrency(selectedPayslip.salary)}</span></div>
              <div className="flex justify-between text-slate-300"><span>Bonus</span><span>{formatCurrency(selectedPayslip.bonus)}</span></div>
              <div className="flex justify-between border-t border-slate-800 pt-3 text-slate-300"><span>Deductions</span><span>{formatCurrency(selectedPayslip.deduction)}</span></div>
              <div className="flex justify-between border-t border-slate-800 pt-3 font-bold text-white"><span>Net Pay</span><span className="text-emerald-400">{formatCurrency(selectedPayslip.net)}</span></div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs"><span className="text-slate-400">Payment status</span><span className={selectedPayslip.status === "Paid" ? "text-emerald-400" : "text-amber-400"}>{selectedPayslip.status}{selectedPayslip.paidDate ? ` · ${selectedPayslip.paidDate}` : ""}</span></div>
            <div className="flex justify-end gap-2"><button onClick={() => setSelectedPayslip(null)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-400">Close</button><button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"><Printer size={14} />Print Statement</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
