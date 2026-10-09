import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  Users,
  Search,
  Eye,
  RotateCcw,
  Trash2,
  Calendar,
  FileText,
  Clock,
  IndianRupee,
  ShieldCheck,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchArchivedEmployees,
  fetchArchivedEmployeeById,
  restoreArchivedEmployee,
  purgeArchivedEmployee,
} from "@/api/employees.api";

const formatCurrency = (val) =>
  "₹" + Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ArchivedEmployees() {
  const { token } = useAuth();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal for Viewing Single Archive Details
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("PAYROLL"); // PAYROLL, ATTENDANCE, LEAVES, TASKS
  const [detailLoading, setDetailLoading] = useState(false);

  const loadArchives = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const res = await fetchArchivedEmployees(token);
      setArchives(res.archivedEmployees || res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load archived employee records.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  // Open Full Archive Detail Modal
  const openArchiveDetails = async (id) => {
    setDetailLoading(true);
    setActiveModalTab("PAYROLL");
    try {
      const res = await fetchArchivedEmployeeById(id, token);
      setSelectedArchive(res.archivedEmployee || res.data);
    } catch (err) {
      alert(err.message || "Failed to load full archive record.");
    } finally {
      setDetailLoading(false);
    }
  };

  // Restore Employee Back to Active
  const handleRestore = async (archive) => {
    if (
      !window.confirm(
        `Restore ${archive.name} back to the active employees directory? They will reappear in active workforce lists.`
      )
    ) {
      return;
    }
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await restoreArchivedEmployee(archive._id, token);
      setSuccessMsg(res.message || "Employee successfully restored.");
      if (selectedArchive?._id === archive._id) setSelectedArchive(null);
      await loadArchives();
    } catch (err) {
      setError(err.message || "Failed to restore employee.");
    } finally {
      setActionLoading(false);
    }
  };

  // Permanently Purge Archive
  const handlePurge = async (archive) => {
    if (
      !window.confirm(
        `Are you absolutely sure you want to permanently delete all archived history for ${archive.name}? This action cannot be undone.`
      )
    ) {
      return;
    }
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await purgeArchivedEmployee(archive._id, token);
      setSuccessMsg(res.message || "Archived records permanently purged.");
      if (selectedArchive?._id === archive._id) setSelectedArchive(null);
      await loadArchives();
    } catch (err) {
      setError(err.message || "Failed to purge archive record.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredArchives = useMemo(() => {
    return archives.filter((a) => {
      const q = search.toLowerCase();
      return (
        (a.name || "").toLowerCase().includes(q) ||
        (a.employeeId || "").toLowerCase().includes(q) ||
        (a.role || "").toLowerCase().includes(q) ||
        (a.department || "").toLowerCase().includes(q)
      );
    });
  }, [archives, search]);

  const totalArchivedPayslips = archives.reduce((sum, a) => sum + (a.payrollCount || 0), 0);
  const totalArchivedAttendance = archives.reduce((sum, a) => sum + (a.attendanceCount || 0), 0);
  const totalArchivedLeaves = archives.reduce((sum, a) => sum + (a.leaveCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link to="/settings" className="mb-2 block text-xs text-slate-400 hover:text-white">
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Archive className="text-indigo-400" size={28} />
            Archived Staff & Past Employee Records
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Historical records for offboarded employees. Deleted staff are safely removed from active operations but their past payslips, attendance, and leaves are preserved here.
          </p>
        </div>

        <Link
          to="/employees"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <Users size={15} />
          Active Directory
        </Link>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-white">
            <X size={15} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-white">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Top Stat KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Offboarded Staff</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{archives.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Separated from active systems</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Preserved Payslips</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <FileText size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-400">{totalArchivedPayslips}</p>
          <p className="mt-1 text-[11px] text-slate-500">Historical salary records</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Attendance Logs</span>
            <div className="rounded-xl bg-sky-500/10 p-2 text-sky-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-sky-400">{totalArchivedAttendance}</p>
          <p className="mt-1 text-[11px] text-slate-500">Punches & working hours</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Leave Applications</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
              <Calendar size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-400">{totalArchivedLeaves}</p>
          <p className="mt-1 text-[11px] text-slate-500">Past leave approvals</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search archived staff by name, ID, role, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Archives Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading archive records...
          </div>
        ) : filteredArchives.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center p-6">
            <Archive className="mb-2 text-slate-600" size={36} />
            <h3 className="text-base font-semibold text-white">No archived employees found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md">
              When an employee is deleted from the active directory, all their associated payslips, attendance punches, and leaves are automatically archived here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-4">Offboarded Employee</th>
                  <th className="px-4 py-4">Designation & Dept</th>
                  <th className="px-4 py-4">Last Salary</th>
                  <th className="px-4 py-4">Date Archived</th>
                  <th className="px-4 py-4">Preserved History</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArchives.map((a) => (
                  <tr key={a._id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-semibold text-white">
                      {a.name}
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {a.employeeId || "EMP"} • {a.email || "No email"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {a.role}
                      <span className="block text-[11px] text-slate-500">{a.department || "Operations"}</span>
                    </td>
                    <td className="px-4 py-4 font-mono font-medium text-slate-300">
                      {formatCurrency(a.salary)}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {new Date(a.archivedAt).toLocaleDateString()}
                      <span className="block text-[10px] text-slate-500">By {a.archivedBy}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                          {a.payrollCount} Payslips
                        </span>
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                          {a.attendanceCount} Punches
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          {a.leaveCount} Leaves
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openArchiveDetails(a._id)}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
                        >
                          <Eye size={12} /> View History
                        </button>
                        <button
                          onClick={() => handleRestore(a)}
                          title="Restore Employee to Active Directory"
                          disabled={actionLoading}
                          className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300"
                        >
                          <RotateCcw size={13} />
                        </button>
                        <button
                          onClick={() => handlePurge(a)}
                          title="Permanently Purge Record"
                          disabled={actionLoading}
                          className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-rose-400 hover:bg-slate-700 hover:text-rose-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════════════════════ DEEP ARCHIVE DETAIL MODAL ════════════════════ */}
      {selectedArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                  Archived Staff Profile & Historical Records
                </span>
                <h3 className="mt-1 text-2xl font-bold text-white">{selectedArchive.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedArchive.employeeId || "EMP"} • {selectedArchive.role} • {selectedArchive.department} • Joined: {selectedArchive.joinDate || "N/A"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Archived on {new Date(selectedArchive.archivedAt).toLocaleString()} by {selectedArchive.archivedBy}
                </p>
              </div>
              <button
                onClick={() => setSelectedArchive(null)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveModalTab("PAYROLL")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeModalTab === "PAYROLL"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Past Payslips ({selectedArchive.payrollRecords?.length || 0})
              </button>
              <button
                onClick={() => setActiveModalTab("ATTENDANCE")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeModalTab === "ATTENDANCE"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Past Attendance ({selectedArchive.attendanceRecords?.length || 0})
              </button>
              <button
                onClick={() => setActiveModalTab("LEAVES")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeModalTab === "LEAVES"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Past Leaves ({selectedArchive.leaveRecords?.length || 0})
              </button>
              <button
                onClick={() => setActiveModalTab("TASKS")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeModalTab === "TASKS"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Appointments & Tasks ({((selectedArchive.appointments?.length || 0) + (selectedArchive.tasks?.length || 0))})
              </button>
            </div>

            {/* SUBTAB 1: PAST PAYSLIPS */}
            {activeModalTab === "PAYROLL" && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(!selectedArchive.payrollRecords || selectedArchive.payrollRecords.length === 0) ? (
                  <p className="text-center py-8 text-xs text-slate-500">No past payslips on record.</p>
                ) : (
                  selectedArchive.payrollRecords.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs flex flex-col justify-between sm:flex-row sm:items-center gap-3"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{p.month}</div>
                        <p className="text-slate-400 mt-0.5">
                          Base: {formatCurrency(p.baseSalary || p.salary)} • Bonus: {formatCurrency(p.bonus)} • Deductions: -{formatCurrency(p.totalDeductions || p.deduction)}
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          Paid Days: {p.paidDays || 26} • LOP: -{formatCurrency(p.lossOfPay || 0)} • Status: {p.status}
                          {p.paymentRef ? ` (${p.paymentRef})` : ""}
                        </p>
                      </div>
                      <div className="text-right sm:self-center">
                        <span className="text-base font-bold font-mono text-emerald-400">
                          {formatCurrency(p.netSalary || p.net)}
                        </span>
                        <div className="text-[10px] text-slate-500">Final Take-Home</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUBTAB 2: PAST ATTENDANCE */}
            {activeModalTab === "ATTENDANCE" && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(!selectedArchive.attendanceRecords || selectedArchive.attendanceRecords.length === 0) ? (
                  <p className="text-center py-8 text-xs text-slate-500">No attendance logs on record.</p>
                ) : (
                  selectedArchive.attendanceRecords.map((att, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white">{att.date}</span>
                        <span className="text-slate-400 ml-3">
                          {att.checkIn} – {att.checkOut} ({att.hours || 0} hrs)
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          att.status === "Present"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : att.status === "Late"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUBTAB 3: PAST LEAVES */}
            {activeModalTab === "LEAVES" && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(!selectedArchive.leaveRecords || selectedArchive.leaveRecords.length === 0) ? (
                  <p className="text-center py-8 text-xs text-slate-500">No leave records on record.</p>
                ) : (
                  selectedArchive.leaveRecords.map((lv, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white">{lv.type}</span>
                        <span className="text-slate-400 ml-3">
                          {lv.from} to {lv.to} ({lv.days} day(s))
                        </span>
                        {lv.reason && <p className="text-slate-500 text-[10px] mt-0.5">"{lv.reason}"</p>}
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {lv.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUBTAB 4: APPOINTMENTS & TASKS */}
            {activeModalTab === "TASKS" && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Appointments</h4>
                  {(!selectedArchive.appointments || selectedArchive.appointments.length === 0) ? (
                    <p className="text-xs text-slate-500">No appointments recorded.</p>
                  ) : (
                    selectedArchive.appointments.map((ap, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs">
                        <span className="text-white font-medium">{ap.service || "Appointment"}</span> on {ap.date || ap.startTime}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Tasks</h4>
                  {(!selectedArchive.tasks || selectedArchive.tasks.length === 0) ? (
                    <p className="text-xs text-slate-500">No tasks recorded.</p>
                  ) : (
                    selectedArchive.tasks.map((tk, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs">
                        <span className="text-white font-medium">{tk.title || tk.task}</span> - Status: {tk.status}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleRestore(selectedArchive)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <RotateCcw size={14} /> Restore to Active Directory
              </button>

              <button
                onClick={() => setSelectedArchive(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
