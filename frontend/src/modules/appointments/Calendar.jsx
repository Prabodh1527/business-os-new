import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAppointments } from "@/api/appointments.api";

export default function Calendar() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 baseline
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (token) {
          const res = await fetchAppointments(token);
          if (res.success) {
            setAppointments(res.appointments || res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar Days Computation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const paddedDay = d < 10 ? `0${d}` : `${d}`;
      const paddedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
      const dateString = `${year}-${paddedMonth}-${paddedDay}`;

      const dayBookings = appointments.filter((a) => a.date?.startsWith(dateString));
      cells.push({ day: d, dateString, bookings: dayBookings, key: `day-${d}` });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayIndex, appointments]);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/appointments"
            className="mb-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Appointments
          </Link>
          <h1 className="text-3xl font-bold text-white">Appointment Calendar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time monthly overview of scheduled customer bookings.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:border-indigo-500 hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="min-w-[150px] text-center text-lg font-semibold text-white">
              {monthName}
            </h2>
            <button
              onClick={nextMonth}
              className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:border-indigo-500 hover:text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <Link
            to="/appointments/booking"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            <Plus size={16} /> Book Slot
          </Link>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {calendarCells.map((cell) => {
          if (!cell.day) {
            return (
              <div
                key={cell.key}
                className="min-h-[120px] rounded-2xl border border-slate-800/40 bg-slate-900/20"
              />
            );
          }

          const hasBookings = cell.bookings && cell.bookings.length > 0;

          return (
            <div
              key={cell.key}
              className={`min-h-[120px] rounded-2xl border p-3 transition ${
                hasBookings
                  ? "border-slate-700 bg-slate-900 hover:border-indigo-500/80"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-white text-sm">
                  {cell.day}
                </span>
                {hasBookings && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                    {cell.bookings.length}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[80px]">
                {cell.bookings?.map((b) => (
                  <div
                    key={b._id}
                    className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-1.5 text-xs text-indigo-300"
                  >
                    <p className="font-semibold truncate">
                      {b.customer?.name}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={10} />
                      <span>{b.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}