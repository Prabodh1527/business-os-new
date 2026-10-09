// frontend/src/modules/crm/CustomerProfile.jsx
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BadgeCheck,
  Edit,
  Trash2,
  Clock3,
  IndianRupee,
  CalendarDays,
  NotebookPen,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchCustomerById, deleteCustomer } from "@/api/customer.api";

export default function CustomerProfile() {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("id");
  const navigate = useNavigate();
  const { token } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadProfile() {
      if (!customerId || !token) return;
      try {
        const res = await fetchCustomerById(customerId, token);
        if (res.success) {
          setCustomer(res.customer || res.data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [customerId, token]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(customerId, token);
        navigate("/crm");
      } catch (err) {
        alert(err.message || "Failed to delete customer");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Customer not found.</p>
        <Link to="/crm" className="mt-3 inline-block text-sm text-indigo-400">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  const formattedAddress = typeof customer.address === "object"
    ? `${customer.address?.street || ""} ${customer.address?.city || ""} ${customer.address?.state || ""}`.trim() || "Address not provided"
    : customer.address || "Address not provided";

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
          <h1 className="text-3xl font-bold text-white">Customer Profile</h1>
          <p className="mt-1 text-slate-400">Comprehensive customer records and history.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={18} />
            Delete
          </button>
          <Link
            to={`/crm/edit?id=${customer._id}`}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            <Edit size={18} />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
            {customer.name?.[0]?.toUpperCase() || "C"}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                <BadgeCheck size={14} className="mr-1 inline" />
                {customer.status || "ACTIVE"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-indigo-400" />
                {customer.phone || "No phone number"}
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-indigo-400" />
                {customer.email || "No email address"}
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-indigo-400" />
                Joined {new Date(customer.createdAt).toLocaleDateString("en-IN")}
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-indigo-400" />
                {formattedAddress}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 p-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "overview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <User size={16} className="mr-2 inline" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <NotebookPen size={16} className="mr-2 inline" />
            Notes
          </button>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact & Company Details</h3>
              <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Full Name</span>
                  <span className="text-white font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Company</span>
                  <span className="text-white font-medium">{customer.company || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-white font-medium">{customer.phone || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white font-medium">{customer.email || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">Staff Notes</h3>
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                {customer.notes || "No notes entered for this customer."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}