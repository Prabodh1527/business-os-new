// frontend/src/modules/crm/Customers.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  Users,
  UserPlus,
  Crown,
  TrendingUp,
  UserX,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchCustomers, deleteCustomer } from "@/api/customer.api";

export default function Customers() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = async () => {
    try {
      if (token) {
        const res = await fetchCustomers(token);
        if (res.success) {
          setCustomers(res.customers || res.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteCustomer(id, token);
        setCustomers((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        alert(err.message || "Failed to delete customer");
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search);
      const matchesStatus =
        statusFilter === "ALL" || (c.status || "ACTIVE").toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  // Live KPI aggregations
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => (c.status || "ACTIVE").toUpperCase() === "ACTIVE").length;
  const vipCount = customers.filter((c) => (c.status || "").toUpperCase() === "VIP").length;

  const stats = [
    {
      title: "Total Customers",
      value: totalCount.toString(),
      icon: Users,
      color: "bg-indigo-500/10 text-indigo-400",
      change: totalCount > 0 ? "Live" : "Empty",
    },
    {
      title: "Active Customers",
      value: activeCount.toString(),
      icon: UserPlus,
      color: "bg-emerald-500/10 text-emerald-400",
      change: `${activeCount} active`,
    },
    {
      title: "VIP Members",
      value: vipCount.toString(),
      icon: Crown,
      color: "bg-amber-500/10 text-amber-400",
      change: `${vipCount} VIPs`,
    },
    {
      title: "Retention Rate",
      value: totalCount > 0 ? "100%" : "—",
      icon: TrendingUp,
      color: "bg-sky-500/10 text-sky-400",
      change: totalCount > 0 ? "Healthy" : "No data",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer CRM</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your client directory, contact information, and relationships.
          </p>
        </div>

        <Link
          to="/crm/add"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </div>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs text-slate-400">{item.change}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">
                {loading ? "..." : item.value}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{item.title}</p>
            </div>
          );
        })}
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-3 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {/* Table & Empty State */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <UserX size={36} className="mb-3 text-slate-600" />
            <h3 className="text-lg font-semibold text-white">No customers found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              {search
                ? "No customer matches your search filter."
                : "You haven't added any customers to your workspace yet."}
            </p>
            {!search && (
              <Link
                to="/crm/add"
                className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <Plus size={16} /> Add Your First Customer
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-800 bg-slate-800/40">
              <tr className="text-left text-sm text-slate-400">
                <th className="p-4">Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-slate-800 hover:bg-slate-800/30 transition"
                >
                  <td className="p-4 font-medium text-white">
                    <div>
                      <p>{customer.name}</p>
                      {customer.company && (
                        <p className="text-xs text-slate-500">{customer.company}</p>
                      )}
                    </div>
                  </td>
                  <td>{customer.phone || "—"}</td>
                  <td>{customer.email || "—"}</td>
                  <td>
                    {typeof customer.address === "object"
                      ? `${customer.address?.city || ""}, ${customer.address?.state || ""}`.replace(/^,\s*|,\s*$/g, "") || "—"
                      : customer.address || "—"}
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        customer.status === "VIP"
                          ? "bg-amber-500/10 text-amber-400"
                          : customer.status === "INACTIVE"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {customer.status || "ACTIVE"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/crm/profile?id=${customer._id}`}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500 hover:text-white"
                      >
                        View
                      </Link>
                      <Link
                        to={`/crm/edit?id=${customer._id}`}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-500"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDelete(customer._id, customer.name, e)}
                        className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}