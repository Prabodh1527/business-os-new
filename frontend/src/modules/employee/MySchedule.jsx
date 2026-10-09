import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAppointments, updateAppointment } from "@/api/appointments.api";

const dayKey = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const tabOffsets = { TODAY: 0, TOMORROW: 1 };

export default function MySchedule() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("TODAY");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [noteText, setNoteText] = useState("");

  const loadAppointments = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const response = await fetchAppointments(token);
      setAppointments(response.appointments || response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your schedule.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const visibleAppointments = useMemo(() => {
    if (activeTab === "THIS WEEK") {
      const today = new Date(dayKey(0));
      const end = new Date(dayKey(6));
      return appointments.filter((appointment) => {
        const date = new Date(appointment.date);
        return !Number.isNaN(date.getTime()) && date >= today && date <= end;
      });
    }
    const date = dayKey(tabOffsets[activeTab]);
    return appointments.filter((appointment) => appointment.date?.slice(0, 10) === date);
  }, [activeTab, appointments]);

  const saveChanges = async (id, changes) => {
    setSaving(true);
    setError("");
    try {
      await updateAppointment(id, changes, token);
      await loadAppointments();
      return true;
    } catch (saveError) {
      setError(saveError.message || "Unable to update appointment.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedAppointment) return;
    if (await saveChanges(selectedAppointment._id, { notes: noteText })) {
      setSelectedAppointment(null);
      setNoteText("");
    }
  };

  const heading = activeTab === "TODAY"
    ? "Today's Client Appointments"
    : activeTab === "TOMORROW"
      ? "Tomorrow's Schedule"
      : "This Week's Overview";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">My Schedule & Appointments</h1>
          <p className="mt-1 text-sm text-slate-400">View bookings assigned to you and update their service progress.</p>
        </div>
        <div className="flex items-center gap-1.5 self-start rounded-2xl border border-slate-800 bg-slate-900/90 p-1 sm:self-auto">
          {["TODAY", "TOMORROW", "THIS WEEK"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${activeTab === tab ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/20 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400"><Clock3 size={22} /></div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Assigned Schedule</span>
            <p className="text-lg font-bold text-white">{heading}</p>
            <p className="text-xs text-slate-400">Bookings are linked to your employee account.</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2 text-xs">
          <span className="text-slate-400">Bookings:</span>
          <span className="ml-1.5 font-semibold text-emerald-400">{loading ? "…" : visibleAppointments.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center gap-3 text-white"><CalendarDays size={20} className="text-indigo-400" /><h2 className="text-lg font-semibold">{heading}</h2></div>
        {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading schedule…</p> : visibleAppointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No appointments assigned for this period.</p>
        ) : (
          <div className="space-y-4">
            {visibleAppointments.map((item) => {
              const completed = item.status === "COMPLETED";
              const inProgress = item.status === "IN_PROGRESS";
              const customerName = item.customer?.name || "Customer";
              return (
                <div key={item._id} className={`rounded-2xl border p-5 transition-all ${completed ? "border-slate-800/80 bg-slate-950/40 opacity-80" : inProgress ? "border-emerald-500/30 bg-emerald-950/15" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"}`}>
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white">{customerName}</span>
                        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">{item.status?.replaceAll("_", " ")}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">{item.service}</span>
                        <span>{item.date}</span>
                        <span className="font-mono font-semibold text-emerald-300">{item.time}</span>
                        <span>{item.duration || 30} mins</span>
                      </div>
                      {item.notes && <p className="mt-1 inline-block rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400">Note: {item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2.5 self-start md:self-auto">
                      {item.status === "SCHEDULED" && <button disabled={saving} onClick={() => saveChanges(item._id, { status: "CONFIRMED" })} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50">Accept</button>}
                      {!completed && <button disabled={saving} onClick={() => saveChanges(item._id, { status: inProgress ? "COMPLETED" : "IN_PROGRESS" })} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50 ${inProgress ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"}`}>
                        {inProgress ? <><CheckCircle2 size={14} />Complete Service</> : <><Play size={13} />Start Service</>}
                      </button>}
                      <button disabled={saving} onClick={() => { setSelectedAppointment(item); setNoteText(item.notes || ""); }} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 hover:border-slate-600 hover:text-white disabled:opacity-50">{item.notes ? "Edit Note" : "Add Note"}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Appointment Note: {selectedAppointment.customer?.name || "Customer"}</h3>
            <p className="mt-1 text-xs text-slate-400">Save notes to the appointment record shared with the owner.</p>
            <textarea rows="4" value={noteText} onChange={(event) => setNoteText(event.target.value)} className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-500" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelectedAppointment(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button disabled={saving} onClick={handleSaveNote} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">{saving ? "Saving…" : "Save Note"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
