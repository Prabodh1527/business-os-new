import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  FileText,
  IndianRupee,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookAppointment } from "@/api/appointments.api";
import { fetchCustomers } from "@/api/crm.api";
import { fetchEmployees } from "@/api/employees.api";

export default function Booking() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    customer: "",
    customerEmail: "",
    customerPhone: "",
    employee: "",
    service: "",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    duration: "30",
    amount: "500",
    paymentStatus: "PENDING",
    status: "SCHEDULED",
    notes: "",
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing customers for quick autofill
  useEffect(() => {
    async function loadCustomers() {
      try {
        if (token) {
          const res = await fetchCustomers(token);
          if (res.success) {
            setCustomers(res.customers || res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load customer list:", err);
      }
    }
    loadCustomers();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomerSelect = (e) => {
    const selectedName = e.target.value;
    const found = customers.find((c) => c.name === selectedName);
    if (found) {
      setFormData({
        ...formData,
        customer: found.name,
        customerEmail: found.email || "",
        customerPhone: found.phone || "",
      });
    } else {
      setFormData({
        ...formData,
        customer: selectedName,
      });
    }
  };
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        if (token) {
          const [custRes, invRes, empRes] = await Promise.all([
            fetchCustomers(token),
            fetchInventory(token),
            fetchEmployees(token),
          ]);

          if (custRes.success) {
            setCustomers(custRes.customers || custRes.data || []);
          }

          if (invRes.success) {
            setServices(invRes.inventory || invRes.data || []);
          }

          if (empRes.success) {
            setEmployees(empRes.employees || empRes.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load masters:", err);
      }
    }
    loadMasterData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer.trim() || !formData.service.trim()) {
      setError("Customer name and service are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customer: {
          name: formData.customer.trim(),
          email: formData.customerEmail.trim(),
          phone: formData.customerPhone.trim(),
        },
        service: formData.service.trim(),
        employee: formData.employee.trim() || "Unassigned",
        date: formData.date,
        time: formData.time,
        duration: Number(formData.duration) || 30,
        amount: Number(formData.amount) || 0,
        paymentStatus: formData.paymentStatus,
        status: formData.status,
        notes: formData.notes.trim(),
      };

      await bookAppointment(payload, token);
      navigate("/appointments");
    } catch (err) {
      setError(err.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <Link
          to="/appointments"
          className="mb-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Appointments
        </Link>
        <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
        <p className="mt-1 text-sm text-slate-400">
          Schedule a service session and assign staff in real time.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Customer Selection / Input */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Customer Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-3.5 text-slate-500"
              />
              <input
                type="text"
                name="customer"
                list="customer-suggestions"
                value={formData.customer}
                onChange={handleCustomerSelect}
                placeholder="Type or pick a customer..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                required
              />
              <datalist id="customer-suggestions">
                {customers.map((c) => (
                  <option key={c._id} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Assigned Staff */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Assigned Employee / Specialist
            </label>
            <div className="relative">
              <Briefcase
                size={18}
                className="absolute left-3 top-3.5 text-slate-500"
              />
              <input
                type="text"
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                placeholder="e.g. Sneha, Rohit"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Service Name */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Service <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              placeholder="Haircut, Consultation, Spa..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Service Fee / Price */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Fee / Expected Amount (₹)
            </label>
            <div className="relative">
              <IndianRupee
                size={18}
                className="absolute left-3 top-3.5 text-slate-500"
              />
              <input
                type="number"
                name="amount"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-3.5 text-slate-500"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Time <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Clock
                size={18}
                className="absolute left-3 top-3.5 text-slate-500"
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              min="5"
              step="5"
              value={formData.duration}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Booking Status */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Notes</label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3 top-3.5 text-slate-500"
              />
              <textarea
                rows="4"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Preferences, allergy cautions, or special requests..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 md:col-span-2 mt-2">
            <button
              type="button"
              onClick={() => navigate("/appointments")}
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}