import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, FileText, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { deleteLeave, fetchLeaves, submitLeave } from "@/api/leaves.api";

const initialForm = () => ({
  type: "Casual Leave",
  from: new Date().toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  halfDay: false,
  reason: "",
});

export default function MyLeaves() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadLeaves = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const response = await fetchLeaves(token);
      setHistory(response.leaves || response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const calculatedDays = useMemo(() => {
    if (!form.from || !form.to || form.to < form.from) return 0;
    if (form.halfDay) return 0.5;
    const start = new Date(`${form.from}T00:00:00`);
    const end = new Date(`${form.to}T00:00:00`);
    return Math.round((end - start) / 86400000) + 1;
  }, [form.from, form.to, form.halfDay]);

  const submitRequest = async (event) => {
    event.preventDefault();
    if (calculatedDays <= 0) return;
    setSubmitting(true);
    setError("");
    try {
      await submitLeave({
        type: form.type,
        from: form.from,
        to: form.halfDay ? form.from : form.to,
        days: calculatedDays,
        reason: form.reason.trim(),
      }, token);
      setSubmitted(true);
      setForm(initialForm());
      await loadLeaves();
    } catch (submitError) {
      setError(submitError.message || "Unable to submit leave request.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitted(false), 2500);
    }
  };

  const cancelRequest = async (id) => {
    setError("");
    try {
      await deleteLeave(id, token);
      await loadLeaves();
    } catch (cancelError) {
      setError(cancelError.message || "Unable to cancel leave request.");
    }
  };

  const filteredHistory = history.filter((item) =>
    statusFilter === "ALL" || item.status?.toUpperCase() === statusFilter.toUpperCase()
  );
  const pendingCount = history.filter((item) => item.status === "Pending").length;
  const approvedCount = history.filter((item) => item.status === "Approved").length;
  const rejectedCount = history.filter((item) => item.status === "Rejected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">My Leaves & Time Off</h1>
        <p className="mt-1 text-sm text-slate-400">Submit leave requests and track their approval status.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}
      {submitted && <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-300"><CheckCircle2 size={16} />Leave request submitted for owner review.</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Pending", pendingCount, "text-amber-400"],
          ["Approved", approvedCount, "text-emerald-400"],
          ["Rejected", rejectedCount, "text-rose-400"],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label} requests</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{loading ? "…" : value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-2.5 text-white"><PlusCircle size={20} className="text-emerald-400" /><h2 className="text-lg font-semibold">Apply for Leave</h2></div>
        <form onSubmit={submitRequest} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Leave Type</label>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500">
              <option>Casual Leave</option><option>Sick Leave</option><option>Paid Vacation</option><option>Emergency Leave</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-xs font-medium text-slate-300">From Date</label><input type="date" required value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value, to: form.halfDay ? event.target.value : form.to })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500" /></div>
            <div><label className="text-xs font-medium text-slate-300">To Date</label><input type="date" required min={form.from} disabled={form.halfDay} value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50" /></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-300"><input type="checkbox" checked={form.halfDay} onChange={(event) => setForm({ ...form, halfDay: event.target.checked, to: event.target.checked ? form.from : form.to })} className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600" />Half-day request</label>
            <span className="text-xs font-semibold text-emerald-400">Duration: {calculatedDays} {calculatedDays === 1 ? "day" : "days"}</span>
          </div>
          <div><label className="text-xs font-medium text-slate-300">Reason & Handover Details</label><textarea required rows="3" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Describe the reason for your request." className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-emerald-500" /></div>
          <button type="submit" disabled={submitting || calculatedDays <= 0} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"><PlusCircle size={16} />{submitting ? "Submitting…" : "Submit Leave Request"}</button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-white">Leave History & Tracker</h2><p className="text-xs text-slate-400">Requests shared with your business owner for approval.</p></div>
          <div className="flex items-center gap-2">{["ALL", "Pending", "Approved", "Rejected"].map((filter) => <button key={filter} onClick={() => setStatusFilter(filter)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${statusFilter === filter ? "bg-emerald-600 text-white" : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"}`}>{filter}</button>)}</div>
        </div>
        {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading leave history…</p> : filteredHistory.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No leave requests found.</p> : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div key={item._id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white">{item.type}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : item.status === "Pending" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>{item.status}</span></div>
                  <p className="text-xs font-medium text-slate-300">{item.from} – {item.to} ({item.days} {item.days === 1 ? "day" : "days"})</p>
                  <p className="text-xs text-slate-400">Reason: {item.reason}</p>
                </div>
                {item.status === "Pending" && <button onClick={() => cancelRequest(item._id)} className="flex items-center gap-1.5 self-start rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-rose-500 hover:text-rose-400 sm:self-auto"><Trash2 size={13} />Cancel Request</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
