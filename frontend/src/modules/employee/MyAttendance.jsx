import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  clockIn,
  clockOut,
  fetchAttendance,
  fetchAttendanceCorrections,
  requestAttendanceCorrection,
} from "@/api/attendance.api";

const todayKey = () => new Date().toISOString().slice(0, 10);
const timeValue = (date = new Date()) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
const timeToDate = (date, time) => new Date(`${date} ${time}`);

const formatElapsed = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
};

export default function MyAttendance() {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    date: todayKey(),
    checkIn: timeValue(new Date(0, 0, 0, 9, 0)),
    checkOut: timeValue(new Date(0, 0, 0, 17, 0)),
    reason: "",
  });
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [attendanceResponse, correctionResponse] = await Promise.all([
        fetchAttendance(token),
        fetchAttendanceCorrections(token),
      ]);
      setRecords(attendanceResponse.attendance || attendanceResponse.data || []);
      setCorrections(correctionResponse.corrections || correctionResponse.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadAttendance]);

  const todayRecord = records.find((record) => record.date === todayKey());
  const clockedIn = Boolean(todayRecord && (!todayRecord.checkOut || todayRecord.checkOut === "-"));
  const checkInDate = todayRecord?.checkIn ? timeToDate(todayRecord.date, todayRecord.checkIn) : null;
  const elapsedSeconds = clockedIn && checkInDate && !Number.isNaN(checkInDate.getTime())
    ? Math.max(0, Math.floor((currentTime - checkInDate) / 1000))
    : 0;

  const monthRecords = useMemo(() => {
    const currentMonth = todayKey().slice(0, 7);
    return records.filter((record) => record.date?.slice(0, 7) === currentMonth);
  }, [records]);
  const presentDays = monthRecords.filter((record) => ["Present", "Late"].includes(record.status)).length;
  const totalHours = monthRecords.reduce((sum, record) => sum + Number(record.hours || 0), 0);
  const averageHours = monthRecords.length ? (totalHours / monthRecords.length).toFixed(1) : "0.0";

  const handleClockToggle = async () => {
    setBusy(true);
    setError("");
    try {
      if (clockedIn) await clockOut({}, token);
      else await clockIn({}, token);
      await loadAttendance();
    } catch (clockError) {
      setError(clockError.message || "Unable to update attendance.");
    } finally {
      setBusy(false);
    }
  };

  const handleCorrectionSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestAttendanceCorrection(correctionForm, token);
      setCorrectionSubmitted(true);
      setShowCorrectionModal(false);
      setCorrectionForm({ ...correctionForm, reason: "" });
      await loadAttendance();
    } catch (submitError) {
      setError(submitError.message || "Unable to submit correction request.");
    } finally {
      setBusy(false);
      setTimeout(() => setCorrectionSubmitted(false), 2500);
    }
  };

  const filteredRecords = records.filter((record) =>
    filter === "ALL" || record.status?.toUpperCase() === filter.toUpperCase()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">My Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">Your recorded clock-ins, clock-outs, and correction requests.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}
      {correctionSubmitted && <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-300"><CheckCircle2 size={16} />Correction request sent to the owner.</p>}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Live Shift Timecard</span>
            <span className="font-mono text-xs text-slate-500">{currentTime.toLocaleDateString()}</span>
          </div>
          <div className="mt-4">
            <div className="font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">{currentTime.toLocaleTimeString()}</div>
            <p className="mt-1 text-xs text-slate-400">{todayRecord ? `First punch today: ${todayRecord.checkIn}` : "No clock-in recorded today."}</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div><p className="text-xs text-slate-400">Elapsed Time Today</p><p className="mt-0.5 font-mono text-xl font-bold text-emerald-400">{clockedIn ? formatElapsed(elapsedSeconds) : `${formatElapsed(Number(todayRecord?.hours || 0) * 3600)}${todayRecord ? "" : " (Off Duty)"}`}</p></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${clockedIn ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>{clockedIn ? "Clocked In" : "Clocked Out"}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={busy || loading} onClick={handleClockToggle} className={`flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50 ${clockedIn ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"}`}><Clock3 size={17} />{busy ? "Saving…" : clockedIn ? "Clock Out for the Day" : "Clock In Now"}</button>
            <button onClick={() => setShowCorrectionModal(true)} className="rounded-xl border border-slate-700 px-4 py-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">Request Correction</button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-base font-semibold text-white">This Month's Summary</h2>
          <p className="mt-0.5 text-xs text-slate-400">{currentTime.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          <div className="mt-5 space-y-3">
            {[
              ["Recorded Shifts", monthRecords.length],
              ["Days Present", presentDays],
              ["Hours Recorded", totalHours.toFixed(1)],
              ["Average Hours / Shift", averageHours],
            ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"><span className="text-slate-400">{label}</span><span className="font-semibold text-white">{loading ? "…" : value}</span></div>)}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <span>Today's status</span><span className={clockedIn ? "font-medium text-emerald-400" : "text-slate-400"}>{todayRecord?.status || "No record"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><ClipboardList size={20} className="text-emerald-400" /><div><h2 className="text-lg font-semibold text-white">Attendance Logs</h2><p className="text-xs text-slate-400">Recorded shift punches shared with your owner.</p></div></div>
          <div className="flex items-center gap-2">{["ALL", "Present", "Late", "Half Day"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${filter === item ? "bg-emerald-600 text-white" : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"}`}>{item}</button>)}</div>
        </div>
        {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading attendance…</p> : filteredRecords.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No attendance records found.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase text-slate-400"><tr><th className="rounded-l-xl px-4 py-3">Date</th><th className="px-4 py-3">Clock In</th><th className="px-4 py-3">Clock Out</th><th className="px-4 py-3">Hours</th><th className="rounded-r-xl px-4 py-3">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">{filteredRecords.map((record) => <tr key={record._id} className="transition hover:bg-slate-800/40"><td className="px-4 py-3.5 font-medium text-white">{record.date}</td><td className="px-4 py-3.5 font-mono text-xs">{record.checkIn}</td><td className="px-4 py-3.5 font-mono text-xs">{record.checkOut || "—"}</td><td className="px-4 py-3.5 text-emerald-300">{Number(record.hours || 0).toFixed(1)}h</td><td className="px-4 py-3.5">{record.status}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-amber-400" /><h2 className="text-base font-semibold text-white">Correction Requests</h2></div>
        {corrections.length === 0 ? <p className="text-sm text-slate-500">No correction requests.</p> : <div className="space-y-2">{corrections.map((request) => <div key={request._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs"><span className="text-slate-300">{request.date}: {request.checkIn} – {request.checkOut} • {request.reason}</span><span className={request.status === "Approved" ? "text-emerald-400" : request.status === "Rejected" ? "text-rose-400" : "text-amber-400"}>{request.status}</span></div>)}</div>}
      </div>

      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Request Attendance Correction</h3>
            <p className="mt-1 text-xs text-slate-400">The owner will review and approve or reject this correction.</p>
            <form onSubmit={handleCorrectionSubmit} className="mt-4 space-y-4">
              <label className="block text-xs font-medium text-slate-300">Date<input type="date" required value={correctionForm.date} onChange={(event) => setCorrectionForm({ ...correctionForm, date: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium text-slate-300">Actual Clock In<input type="time" required value={correctionForm.checkIn} onChange={(event) => setCorrectionForm({ ...correctionForm, checkIn: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" /></label><label className="text-xs font-medium text-slate-300">Actual Clock Out<input type="time" required value={correctionForm.checkOut} onChange={(event) => setCorrectionForm({ ...correctionForm, checkOut: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" /></label></div>
              <label className="block text-xs font-medium text-slate-300">Reason<textarea required rows="3" value={correctionForm.reason} onChange={(event) => setCorrectionForm({ ...correctionForm, reason: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white" /></label>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCorrectionModal(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button><button disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Submitting…" : "Submit Request"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
