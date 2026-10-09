import StaffSubNav from "@/components/employees/StaffSubNav";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle, Clock, Download, IndianRupee, Plus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchEmployees } from "@/api/employees.api";
import { createPayroll, fetchPayroll, updatePayroll } from "@/api/payroll.api";

const currentMonth = () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const blankForm = () => ({ employeeId: "", month: currentMonth(), salary: "", bonus: "0", deduction: "0" });

export default function Payroll() {
  const { token } = useAuth();
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [payrollResponse, employeeResponse] = await Promise.all([
        fetchPayroll(token),
        fetchEmployees(token),
      ]);
      setPayroll(payrollResponse.payroll || payrollResponse.data || []);
      setEmployees(employeeResponse.employees || employeeResponse.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load payroll.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const months = useMemo(() => [...new Set([currentMonth(), ...payroll.map((item) => item.month)])], [payroll]);
  const monthPayroll = payroll.filter((item) => item.month === month);
  const total = monthPayroll.reduce((sum, item) => sum + Number(item.net || 0), 0);
  const paid = monthPayroll.filter((item) => item.status === "Paid");
  const pending = monthPayroll.filter((item) => item.status !== "Paid");

  const changeEmployee = (employeeId) => {
    const employee = employees.find((item) => item._id === employeeId);
    setForm({
      ...form,
      employeeId,
      salary: employee?.salary ? String(employee.salary) : "",
    });
  };

  const generatePayroll = async (event) => {
    event.preventDefault();
    const employee = employees.find((item) => item._id === form.employeeId);
    if (!employee) return;
    setSubmitting(true);
    setError("");
    try {
      await createPayroll({
        employee: employee.name,
        employeeId: employee.employeeId,
        employeeEmail: employee.email,
        role: employee.role,
        month: form.month,
        salary: Number(form.salary),
        bonus: Number(form.bonus),
        deduction: Number(form.deduction),
      }, token);
      setShowForm(false);
      setMonth(form.month);
      setForm(blankForm());
      await loadData();
    } catch (createError) {
      setError(createError.message || "Unable to generate payroll.");
    } finally {
      setSubmitting(false);
    }
  };

  const markPaid = async (item) => {
    try {
      setError("");
      await updatePayroll(item._id, { status: "Paid" }, token);
      await loadData();
    } catch (updateError) {
      setError(updateError.message || "Unable to update payroll status.");
    }
  };

  const exportCSV = () => {
    if (!monthPayroll.length) return;
    const rows = [["Employee", "Role", "Month", "Salary", "Bonus", "Deduction", "Net", "Status"], ...monthPayroll.map((item) => [item.employee, item.role, item.month, item.salary, item.bonus, item.deduction, item.net, item.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Payroll_${month.replaceAll(" ", "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { title: "Total Payroll", value: formatCurrency(total), icon: IndianRupee, color: "bg-indigo-500/10 text-indigo-400" },
    { title: "Employees Paid", value: paid.length, icon: Users, color: "bg-sky-500/10 text-sky-400" },
    { title: "Paid Records", value: paid.length, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-400" },
    { title: "Pending", value: pending.length, icon: Clock, color: "bg-amber-500/10 text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <StaffSubNav />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><Link to="/employees" className="mb-3 block text-sm text-slate-400 hover:text-white">← Back to Employees</Link><h1 className="text-3xl font-bold text-white">Payroll Management</h1><p className="mt-1 text-slate-400">Generate payroll and publish employee payslips.</p></div>
        <div className="flex gap-3"><button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"><Plus size={17} />Generate Payroll</button><button onClick={exportCSV} disabled={!monthPayroll.length} className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-white disabled:opacity-50"><Download size={17} />Export</button></div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

      {showForm && <form onSubmit={generatePayroll} className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:grid-cols-2 xl:grid-cols-3">
        <select required value={form.employeeId} onChange={(event) => changeEmployee(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"><option value="">Select employee</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name} · {employee.role}</option>)}</select>
        <input required value={form.month} onChange={(event) => setForm({ ...form, month: event.target.value })} placeholder="Month, e.g. October 2026" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" />
        <input required type="number" min="0" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} placeholder="Base salary" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" />
        <input type="number" min="0" value={form.bonus} onChange={(event) => setForm({ ...form, bonus: event.target.value })} placeholder="Bonus" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" />
        <input type="number" min="0" value={form.deduction} onChange={(event) => setForm({ ...form, deduction: event.target.value })} placeholder="Deductions" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" />
        <div className="flex justify-end gap-3 sm:col-span-2 xl:col-span-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300">Cancel</button><button disabled={submitting} className="rounded-xl bg-indigo-600 px-5 py-2 text-white disabled:opacity-50">{submitting ? "Saving…" : "Create Payroll Record"}</button></div>
      </form>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className={`inline-flex rounded-xl p-3 ${item.color}`}><Icon size={20} /></div><h2 className="mt-5 text-2xl font-bold text-white">{loading ? "…" : item.value}</h2><p className="text-sm text-slate-400">{item.title}</p></div>; })}</div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><label className="text-sm text-slate-400">Payroll Month<select value={month} onChange={(event) => setMonth(event.target.value)} className="ml-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-white">{months.map((item) => <option key={item}>{item}</option>)}</select></label></div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? <p className="p-10 text-center text-sm text-slate-400">Loading payroll records…</p> : monthPayroll.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No payroll records for {month}.</p> : <table className="w-full min-w-[800px]"><thead className="border-b border-slate-800 bg-slate-800/40 text-left text-sm text-slate-400"><tr><th className="p-4">Employee</th><th>Salary</th><th>Bonus</th><th>Deduction</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr></thead><tbody>{monthPayroll.map((item) => <tr key={item._id} className="border-b border-slate-800 hover:bg-slate-800/30"><td className="p-4"><p className="font-medium text-white">{item.employee}</p><p className="text-xs text-slate-400">{item.role}</p></td><td className="text-slate-300">{formatCurrency(item.salary)}</td><td className="text-emerald-400">{formatCurrency(item.bonus)}</td><td className="text-rose-400">{formatCurrency(item.deduction)}</td><td className="font-semibold text-white">{formatCurrency(item.net)}</td><td><span className={`rounded-full px-3 py-1 text-xs ${item.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{item.status}</span></td><td>{item.status !== "Paid" && <button onClick={() => markPaid(item)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white"><BadgeCheck size={14} />Mark Paid</button>}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
