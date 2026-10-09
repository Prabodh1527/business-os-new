import React, { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Eye,
  FileText,
  Printer,
  Download,
  IndianRupee,
  Clock,
  CheckCircle,
  X,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchPayroll, downloadPayslipPdf } from "@/api/payroll.api";

const formatCurrency = (amount) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function MyPayslips() {
  const { user, token } = useAuth();
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleDownload = async (item) => {
    try {
      setDownloadingId(item._id);
      await downloadPayslipPdf(
        item._id,
        `Payslip_${(user?.name || "Employee").replace(/\s+/g, "_")}_${item.month.replace(/\s+/g, "_")}.pdf`,
        token
      );
    } catch (err) {
      alert(err.message || "Failed to download PDF payslip.");
    } finally {
      setDownloadingId(null);
    }
  };

  const latest = payroll[0];
  const totalNet = payroll.reduce((sum, item) => sum + Number(item.netSalary || item.net || 0), 0);
  const totalPaid = payroll
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + Number(item.netSalary || item.net || 0), 0);
  const totalDeductions = payroll.reduce(
    (sum, item) => sum + Number(item.totalDeductions || item.deduction || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My Payslips & Compensation
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Official monthly salary statements, itemized statutory deductions, and tax records.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
          {error}
        </p>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest Net Pay</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-emerald-400">
            {loading ? "…" : latest ? formatCurrency(latest.netSalary || latest.net) : "—"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {latest?.month || "No statement issued yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Base Monthly Salary</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {loading ? "…" : latest ? formatCurrency(latest.baseSalary || latest.salary) : "—"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Contracted compensation</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Bonus / Incentive</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-indigo-400">
            {loading ? "…" : latest ? formatCurrency(latest.bonus) : "—"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Performance incentive</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Deductions</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-rose-400">
            {loading ? "…" : latest ? formatCurrency(latest.totalDeductions || latest.deduction) : "—"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">LOP + PF + PT + TDS</p>
        </div>
      </div>

      {/* Payslips List */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <FileText size={20} className="text-indigo-400" />
            <div>
              <h2 className="text-base font-semibold">Issued Salary Statements</h2>
              <p className="text-xs text-slate-400">Official payslips issued by your organization.</p>
            </div>
          </div>
          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            {payroll.length} statements
          </span>
        </div>

        {loading ? (
          <p className="py-8 text-center text-xs text-slate-400">Loading payroll records…</p>
        ) : payroll.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <FileText size={32} className="mx-auto mb-2 text-slate-600" />
            No official payslips have been generated for your profile yet.
          </div>
        ) : (
          <div className="space-y-3">
            {payroll.map((item) => (
              <div
                key={item._id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3.5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-indigo-400">
                    <BadgeCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.month}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Gross: {formatCurrency(item.grossEarnings || (item.baseSalary + item.bonus))} • Take-Home:{" "}
                      <span className="font-bold text-emerald-400 font-mono">
                        {formatCurrency(item.netSalary || item.net)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      item.status === "Paid"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {item.status}
                    {item.paidDate ? ` (${item.paidDate})` : ""}
                  </span>

                  <button
                    onClick={() => setSelectedPayslip(item)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                  >
                    <Eye size={13} /> Details
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item._id}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Download size={13} />
                    {downloadingId === item._id ? "Generating..." : "PDF Payslip"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && payroll.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Total lifetime take-home recorded: {formatCurrency(totalNet)} • Disbursed: {formatCurrency(totalPaid)}
          </p>
        )}
      </div>

      {/* ════════════════════ MODAL: STATEMENT BREAKDOWN ════════════════════ */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                  Official Salary Statement
                </span>
                <h3 className="mt-1 text-xl font-bold text-white">{selectedPayslip.month}</h3>
                <p className="text-xs text-slate-400">
                  {user?.name} ({user?.employeeId || "Staff"}) • {user?.jobTitle || selectedPayslip.role}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Attendance & Days Summary */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Standard Work Days</span>
                <p className="text-sm font-bold text-white">{selectedPayslip.workDaysInMonth || 26}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Paid Days</span>
                <p className="text-sm font-bold text-emerald-400">
                  {selectedPayslip.paidDays !== undefined ? selectedPayslip.paidDays : 26}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Loss of Pay Days</span>
                <p className="text-sm font-bold text-rose-400">{selectedPayslip.unpaidDays || 0}</p>
              </div>
            </div>

            {/* Breakdown Lists */}
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-xs">
              <div>
                <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-2">Earnings</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Monthly Salary</span>
                    <span className="font-mono text-white">
                      {formatCurrency(selectedPayslip.baseSalary || selectedPayslip.salary)}
                    </span>
                  </div>
                  {selectedPayslip.bonus > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Performance Bonus</span>
                      <span className="font-mono text-emerald-400">
                        +{formatCurrency(selectedPayslip.bonus)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white border-t border-slate-800/80 pt-1.5">
                    <span>Gross Earnings</span>
                    <span className="font-mono text-indigo-400">
                      {formatCurrency(selectedPayslip.grossEarnings || (selectedPayslip.baseSalary + selectedPayslip.bonus))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-2">Deductions</h4>
                <div className="space-y-1.5">
                  {selectedPayslip.lossOfPay > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Loss of Pay ({selectedPayslip.unpaidDays} days)</span>
                      <span className="font-mono text-rose-400">
                        -{formatCurrency(selectedPayslip.lossOfPay)}
                      </span>
                    </div>
                  )}
                  {(selectedPayslip.deductionLines || []).map((d, i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span>{d.name}</span>
                      <span className="font-mono text-rose-400">-{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                  {selectedPayslip.lossOfPay === 0 && (!selectedPayslip.deductionLines || selectedPayslip.deductionLines.length === 0) && (
                    <div className="text-slate-500">Nil Deductions</div>
                  )}
                  <div className="flex justify-between font-bold text-white border-t border-slate-800/80 pt-1.5">
                    <span>Total Deductions</span>
                    <span className="font-mono text-rose-400">
                      -{formatCurrency(selectedPayslip.totalDeductions || selectedPayslip.deduction)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Box */}
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Net Salary Take-Home
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Status: <span className="font-semibold text-white">{selectedPayslip.status}</span>
                  {selectedPayslip.paymentRef && ` • Ref: ${selectedPayslip.paymentRef}`}
                </p>
              </div>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(selectedPayslip.netSalary || selectedPayslip.net)}
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedPayslip)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
