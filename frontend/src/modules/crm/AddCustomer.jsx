// frontend/src/modules/crm/AddCustomer.jsx
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { createCustomer } from "@/api/customer.api";

export default function AddCustomer() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError("Customer name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createCustomer(form, token);
      navigate("/crm");
    } catch (err) {
      setError(err.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/crm"
            className="mb-3 inline-flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Customers
          </Link>
          <h1 className="text-3xl font-bold text-white">Add Customer</h1>
          <p className="mt-1 text-slate-400">Create a new customer profile in your workspace.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="rahul@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Company / Organization</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">City</label>
            <input
              name="address.city"
              value={form.address.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="Bengaluru"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">State / Region</label>
            <input
              name="address.state"
              value={form.address.state}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="Karnataka"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Street Address</label>
            <input
              name="address.street"
              value={form.address.street}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="12 MG Road"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Internal Notes / Preferences</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              placeholder="Preferred services, notes, or specific client requests..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            to="/crm"
            className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:border-indigo-500 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}