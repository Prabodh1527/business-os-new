import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Megaphone,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAppointments } from "@/api/appointments.api";
import { fetchAttendance, clockIn, clockOut } from "@/api/attendance.api";
import { fetchLeaves } from "@/api/leaves.api";
import { fetchNotifications } from "@/api/notifications.api";
import { fetchTasks } from "@/api/tasks.api";

const getRows = (response, key) => response?.[key] || response?.data || [];
const today = () => new Date().toISOString().slice(0, 10);

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState({
    appointments: [],
    tasks: [],
    attendance: [],
    leaves: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [appointmentResponse, taskResponse, attendanceResponse, leaveResponse, notificationResponse] =
        await Promise.all([
          fetchAppointments(token),
          fetchTasks(token),
          fetchAttendance(token, { date: today() }),
          fetchLeaves(token),
          fetchNotifications(token),
        ]);
      setData({
        appointments: getRows(appointmentResponse, "appointments"),
        tasks: getRows(taskResponse, "tasks"),
        attendance: getRows(attendanceResponse, "attendance"),
        leaves: getRows(leaveResponse, "leaves"),
        notifications: getRows(notificationResponse, "notifications"),
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load your workspace.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const todayAppointments = useMemo(
    () => data.appointments.filter((item) => item.date?.slice(0, 10) === today()),
    [data.appointments]
  );
  const pendingTasks = data.tasks.filter((task) => task.status !== "Completed");
  const highPriorityTasks = pendingTasks.filter((task) => task.priority === "High" || task.priority === "Urgent");
  const pendingLeaves = data.leaves.filter((leave) => leave.status === "Pending");
  const attendanceToday = data.attendance.find((item) => item.date === today());
  const clockedIn = Boolean(attendanceToday && (!attendanceToday.checkOut || attendanceToday.checkOut === "-"));
  const employeeId = user?.employeeId || "";
  const department = user?.department || "Department not set";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleClockToggle = async () => {
    if (!token || busy) return;
    setBusy(true);
    setError("");
    try {
      if (clockedIn) await clockOut({}, token);
      else await clockIn({}, token);
      await loadDashboard();
    } catch (clockError) {
      setError(clockError.message || "Unable to update attendance.");
    } finally {
      setBusy(false);
    }
  };

  const nextAppointment = todayAppointments
    .filter((item) => item.status !== "COMPLETED" && item.status !== "CANCELLED")
    .sort((a, b) => String(a.time).localeCompare(String(b.time)))[0];

  const cards = [
    {
      title: "Today's Schedule",
      value: `${todayAppointments.length} appointment${todayAppointments.length === 1 ? "" : "s"}`,
      subtext: nextAppointment ? `Next at ${nextAppointment.time}` : "No upcoming appointments",
      icon: CalendarDays,
      color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    },
    {
      title: "Assigned Tasks",
      value: `${pendingTasks.length} active`,
      subtext: `${highPriorityTasks.length} high priority`,
      icon: ClipboardList,
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    {
      title: "Shift Attendance",
      value: clockedIn ? "Clocked In" : "Not Clocked In",
      subtext: attendanceToday ? `Since ${attendanceToday.checkIn}` : "No attendance record today",
      icon: Clock3,
      color: clockedIn
        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
        : "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    {
      title: "Leave Requests",
      value: `${pendingLeaves.length} pending`,
      subtext: `${data.leaves.length} total requests`,
      icon: FileText,
      color: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 p-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {employeeId && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <UserCheck size={13} />
                {employeeId}
              </span>
            )}
            <span className="text-xs text-slate-400">• {department}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {greeting}, {user?.name || "there"}!
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your workspace at a glance: {todayAppointments.length} appointments, {pendingTasks.length} active tasks, and {pendingLeaves.length} pending leave requests.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-800 bg-slate-950/70 p-3 md:self-auto">
          <div className="mr-1 text-right">
            <p className="text-xs font-medium text-slate-400">Shift Status</p>
            <p className="text-sm font-semibold text-white">{clockedIn ? "Active on Shift" : "Off Clock"}</p>
          </div>
          <button
            onClick={handleClockToggle}
            disabled={busy || loading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50 ${
              clockedIn ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <Clock3 size={15} />
            {busy ? "Saving..." : clockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">{card.title}</p>
                <div className={`rounded-xl p-2.5 ${card.color}`}><Icon size={18} /></div>
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">{loading ? "…" : card.value}</h2>
              <p className="mt-1 text-xs text-slate-400">{loading ? "Loading…" : card.subtext}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5"><CalendarDays className="text-indigo-400" size={18} /><h2 className="text-lg font-semibold text-white">Today’s Schedule</h2></div>
            <Link to="/employee/schedule" className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300">View full schedule <ArrowRight size={13} /></Link>
          </div>
          <div className="mt-4 space-y-3">
            {todayAppointments.slice(0, 3).map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 text-sm">
                <div>
                  <p className="font-semibold text-white">{item.customer?.name || "Customer"}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.service} • {item.time}</p>
                </div>
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{item.status}</span>
              </div>
            ))}
            {!loading && todayAppointments.length === 0 && <p className="py-5 text-center text-sm text-slate-500">No appointments scheduled for today.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5"><ClipboardList className="text-emerald-400" size={18} /><h2 className="text-lg font-semibold text-white">Assigned Tasks</h2></div>
            <Link to="/employee/tasks" className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300">Manage tasks <ArrowRight size={13} /></Link>
          </div>
          <div className="mt-4 space-y-3">
            {pendingTasks.slice(0, 3).map((task) => (
              <div key={task._id} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 text-sm">
                <div className="min-w-0 pr-3">
                  <p className="truncate font-medium text-white">{task.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Due: {task.dueDate || "Not set"}</p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">{task.priority}</span>
              </div>
            ))}
            {!loading && pendingTasks.length === 0 && <p className="py-5 text-center text-sm text-slate-500">You have no active tasks.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-3"><Megaphone className="text-amber-400" size={18} /><h2 className="text-lg font-semibold text-white">Latest Updates</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.notifications.slice(0, 4).map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs text-slate-400">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1.5 leading-relaxed">{item.message}</p>
            </div>
          ))}
          {!loading && data.notifications.length === 0 && <p className="text-sm text-slate-500">No new updates.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Staff Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/employee/attendance" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500 hover:text-white sm:text-sm"><Clock3 size={16} className="text-emerald-400" />Attendance & Logs</Link>
          <Link to="/employee/leaves" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white sm:text-sm"><CalendarRange size={16} className="text-indigo-400" />Apply for Leave</Link>
          <Link to="/employee/schedule" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-teal-500 hover:text-white sm:text-sm"><CalendarDays size={16} className="text-teal-400" />View Schedule</Link>
          <Link to="/employee/payslips" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-purple-500 hover:text-white sm:text-sm"><BadgeCheck size={16} className="text-purple-400" />View Payslips</Link>
          <Link to="/employee/leaves" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white sm:text-sm"><CheckCircle2 size={16} className="text-slate-400" />Leave Requests</Link>
        </div>
      </div>
    </div>
  );
}
