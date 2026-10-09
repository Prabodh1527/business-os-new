import StaffSubNav from "@/components/employees/StaffSubNav";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle, Clock, Download, Plus, Search, Users, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchEmployees } from "@/api/employees.api";
import { fetchLeaves, submitLeave, updateLeaveStatus } from "@/api/leaves.api";

const emptyForm = {
  employeeId: "",
  type: "Casual Leave",
  from: new Date().toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  reason: "",
};

export default function Leaves() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [leaveResponse, employeeResponse] = await Promise.all([
        fetchLeaves(token),
        fetchEmployees(token),
      ]);
      setLeaves(leaveResponse.leaves || leaveResponse.data || []);
      setEmployees(employeeResponse.employees || employeeResponse.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load leave management data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (id, status) => {
    try {
      setError("");
      await updateLeaveStatus(id, status, token);
      await loadData();
    } catch (updateError) {
      setError(updateError.message || "Unable to update leave request.");
    }
  };

  const addLeave = async (event) => {
    event.preventDefault();
    const employee = employees.find((item) => item._id === form.employeeId);
    if (!employee) return;
    setSubmitting(true);
    setError("");
    try {
      const days = Math.max(0.5, Math.round((new Date(`${form.to}T00:00:00`) - new Date(`${form.from}T00:00:00`)) / 86400000) + 1);
      await submitLeave({
        employee: employee.name,
        employeeId: employee.employeeId,
        employeeEmail: employee.email,
        role: employee.role,
        type: form.type,
        from: form.from,
        to: form.to,
        days,
        reason: form.reason,
      }, token);
      setShowForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (submitError) {
      setError(submitError.message || "Unable to create leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = useMemo(() => leaves.filter((leave) =>
    `${leave.employee} ${leave.type} ${leave.status}`.toLowerCase().includes(search.toLowerCase())
  ), [leaves, search]);

  const stats = [
    { title: "Pending Requests", value: leaves.filter((item) => item.status === "Pending").length, icon: Clock, color: "bg-amber-500/10 text-amber-400" },
    { title: "Approved", value: leaves.filter((item) => item.status === "Approved").length, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-400" },
    { title: "Rejected", value: leaves.filter((item) => item.status === "Rejected").length, icon: XCircle, color: "bg-rose-500/10 text-rose-400" },
    { title: "Employees", value: employees.length, icon: Users, color: "bg-indigo-500/10 text-indigo-400" },
  ];

  const exportCSV = () => {
    if (!leaves.length) return;
    const rows = [["Employee", "Role", "Type", "From", "To", "Days", "Reason", "Status"], ...leaves.map((item) => [item.employee, item.role, item.type, item.from, item.to, item.days, item.reason, item.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Leave_Requests_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <StaffSubNav />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><Link to="/employees" className="mb-3 block text-sm text-slate-400 hover:text-white">← Back to Employees</Link><h1 className="text-3xl font-bold text-white">Leave Management</h1><p className="mt-1 text-slate-400">Review employee requests and create leave entries.</p></div>
        <div className="flex gap-3"><button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"><Plus size={17} />Add Leave</button><button onClick={exportCSV} disabled={!leaves.length} className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-white disabled:opacity-50"><Download size={17} />Export</button></div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

      {showForm && <form onSubmit={addLeave} className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-2">
        <select required value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"><option value="">Select employee</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name} · {employee.role}</option>)}</select>
        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"><option>Casual Leave</option><option>Sick Leave</option><option>Paid Vacation</option><option>Emergency Leave</option></select>
        <label className="text-xs text-slate-400">From<input required type="date" value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white" /></label>
        <label className="text-xs text-slate-400">To<input required type="date" min={form.from} value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white" /></label>
        <textarea required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Reason" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white md:col-span-2" />
        <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300">Cancel</button><button disabled={submitting} className="rounded-xl bg-indigo-600 px-5 py-2 text-white disabled:opacity-50">{submitting ? "Saving…" : "Save Request"}</button></div>
      </form>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className={`inline-flex rounded-xl p-3 ${item.color}`}><Icon size={20} /></div><h2 className="mt-5 text-2xl font-bold text-white">{loading ? "…" : item.value}</h2><p className="text-sm text-slate-400">{item.title}</p></div>; })}</div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="relative max-w-md"><Search size={18} className="absolute left-3 top-3 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee or leave status…" className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 text-white" /></div></div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? <p className="p-10 text-center text-sm text-slate-400">Loading leave requests…</p> : filteredLeaves.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No leave requests found.</p> : <table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-slate-800 bg-slate-800/40 text-slate-400"><tr><th className="p-4">Employee</th><th>Leave</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredLeaves.map((leave) => <tr key={leave._id} className="border-b border-slate-800 hover:bg-slate-800/30"><td className="p-4 text-white">{leave.employee}<p className="text-xs text-slate-400">{leave.role}</p></td><td className="text-slate-300">{leave.type}<p className="text-xs text-slate-500">{leave.days} day(s)</p></td><td className="text-slate-300">{leave.from}<br />{leave.to}</td><td className="max-w-xs text-slate-300">{leave.reason}</td><td><span className={`rounded-full px-3 py-1 text-xs ${leave.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : leave.status === "Rejected" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>{leave.status}</span></td><td><div className="flex gap-2">{leave.status === "Pending" && <><button onClick={() => updateStatus(leave._id, "Approved")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white">Approve</button><button onClick={() => updateStatus(leave._id, "Rejected")} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs text-white">Reject</button></>}</div></td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
