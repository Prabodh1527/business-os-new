import StaffSubNav from "@/components/employees/StaffSubNav";
﻿import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Download,
  CalendarDays,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAttendance,
  fetchAttendanceCorrections,
  recordAttendance,
  reviewAttendanceCorrection,
} from "@/api/attendance.api";
import { fetchEmployees } from "@/api/employees.api";
import AttendanceChart from "@/components/charts/AttendanceChart";

export default function Attendance() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Manual Record Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeName: "",
    role: "Staff",
    date: new Date().toISOString().slice(0, 10),
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    status: "Present",
  });

  const loadData = useCallback(async () => {
    try {
      if (!token) return;
      const [attRes, empRes, correctionRes] = await Promise.all([
        fetchAttendance(token, { date: selectedDate }),
        fetchEmployees(token),
        fetchAttendanceCorrections(token),
      ]);
      if (attRes.success) {
        setRecords(attRes.attendance || attRes.data || []);
      }
      if (empRes.success) {
        setEmployees(empRes.employees || empRes.data || []);
      }
      if (correctionRes.success) {
        setCorrections(correctionRes.corrections || correctionRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load attendance data:", err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecord = async (e) => {
    e.preventDefault();
    if (!form.employeeName) return;

    setSubmitting(true);
    try {
      const res = await recordAttendance(form, token);
      if (res.success) {
        setShowModal(false);
        await loadData();
      }
    } catch (err) {
      alert(err.message || "Failed to record attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCorrectionReview = async (id, status) => {
    try {
      await reviewAttendanceCorrection(id, status, token);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to review attendance correction.");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName || "").toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q)
      );
    });
  }, [records, search]);

  // Aggregate stats
  const presentCount = records.filter((r) => r.status === "Present").length;
  const lateCount = records.filter((r) => r.status === "Late").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;

  return (
    <div className="space-y-6">
      <StaffSubNav />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Staff Attendance</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time daily clock-in records, working hours, and punctuality monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Plus size={16} />
            Record Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Headcount</span>
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{employees.length}</h3>
            <p className="mt-1 text-xs text-slate-500">Registered employees</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Present Today</span>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-400">{presentCount}</h3>
            <p className="mt-1 text-xs text-slate-500">On duty</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Late Arrivals</span>
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-400">{lateCount}</h3>
            <p className="mt-1 text-xs text-slate-500">Delayed check-ins</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Absent / Leave</span>
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-400">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-rose-400">{absentCount}</h3>
            <p className="mt-1 text-xs text-slate-500">Not present</p>
          </div>
        </div>
      </div>

      {/* Attendance Chart */}
      <AttendanceChart />

      {corrections.some((request) => request.status === "Pending") && (
        <section className="rounded-2xl border border-amber-500/20 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Pending Attendance Corrections</h2>
          <div className="space-y-3">
            {corrections.filter((request) => request.status === "Pending").map((request) => (
              <div key={request._id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <div className="text-sm">
                  <p className="font-semibold text-white">{request.employeeName} • {request.date}</p>
                  <p className="mt-1 text-xs text-slate-400">{request.checkIn} – {request.checkOut} · {request.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCorrectionReview(request._id, "Approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500">Approve</button>
                  <button onClick={() => handleCorrectionReview(request._id, "Rejected")} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search */}
      <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendance by employee name or role..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading attendance records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <CalendarDays className="mb-2 text-slate-600" size={32} />
            <p className="text-sm font-medium text-slate-400">No attendance entries for this date</p>
            <p className="text-xs text-slate-500">
              Employees can clock in via their portal, or you can record manually.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r) => (
                  <tr key={r._id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-white">{r.employeeName}</td>
                    <td className="px-6 py-4 text-slate-400">{r.role}</td>
                    <td className="px-6 py-4 text-slate-400">{r.date}</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono text-xs">{r.checkIn}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{r.checkOut || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === "Present"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : r.status === "Late"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">Record Attendance</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecord} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Employee *
                </label>
                {employees.length > 0 ? (
                  <select
                    required
                    value={form.employeeName}
                    onChange={(e) => {
                      const emp = employees.find((x) => x.name === e.target.value);
                      setForm({
                        ...form,
                        employeeName: e.target.value,
                        role: emp?.role || "Staff",
                      });
                    }}
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={form.employeeName}
                    onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                    placeholder="Enter Employee Name"
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Check In Time
                  </label>
                  <input
                    type="text"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    placeholder="09:00 AM"
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
