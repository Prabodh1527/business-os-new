// frontend/src/modules/crm/EditCustomer.jsx
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchCustomerById, updateCustomer } from "@/api/customer.api";

export default function EditCustomer() {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("id");
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    status: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      if (!customerId || !token) return;
      try {
        const res = await fetchCustomerById(customerId, token);
        if (res.success && res.customer) {
          const c = res.customer;
          setForm({
            name: c.name || "",
            phone: c.phone || "",
            email: c.email || "",
            company: c.company || "",
            status: c.status || "ACTIVE",
            notes: c.notes || "",
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [customerId, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateCustomer(customerId, form, token);
      navigate(`/crm/profile?id=${customerId}`);
    } catch (err) {
      setError(err.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading customer details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={customerId ? `/crm/profile?id=${customerId}` : "/crm"}
            className="mb-3 inline-flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Customer</h1>
          <p className="mt-1 text-slate-400">Update customer information and account status.</p>
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
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
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
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Staff Notes</label>
            <textarea
              rows={4}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            to={customerId ? `/crm/profile?id=${customerId}` : "/crm"}
            className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:border-indigo-500 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}