import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Wallet,
  Landmark,
  IndianRupee,
  Search,
  Download,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchInvoices } from "@/api/billing.api";

export default function Payments() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        if (token) {
          const res = await fetchInvoices(token);
          if (res.success) {
            setInvoices(res.invoices || res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load payments data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Extract paid or partially paid records
  const paymentRecords = useMemo(() => {
    return invoices
      .filter((inv) => Number(inv.amountPaid || 0) > 0 || inv.status === "PAID")
      .map((inv) => ({
        id: inv.invoiceNumber,
        customer: inv.customer?.name || "Customer",
        method: inv.paymentMethod || "UPI",
        amount: Number(inv.amountPaid || inv.grandTotal || 0),
        date: inv.updatedAt
          ? new Date(inv.updatedAt).toLocaleDateString("en-IN")
          : "N/A",
        status: inv.status,
      }));
  }, [invoices]);

  // Aggregate Payment Statistics
  const stats = useMemo(() => {
    const totalTransactions = paymentRecords.length;
    let totalCollected = 0;
    let upiTotal = 0;
    let bankTotal = 0;

    paymentRecords.forEach((p) => {
      totalCollected += p.amount;
      if (p.method === "UPI") {
        upiTotal += p.amount;
      } else if (p.method === "BANK_TRANSFER" || p.method === "CARD") {
        bankTotal += p.amount;
      }
    });

    return [
      {
        title: "Total Paid Transactions",
        value: totalTransactions.toString(),
        icon: CreditCard,
        color: "bg-indigo-500/10 text-indigo-400",
      },
      {
        title: "Total Collected",
        value: `₹${totalCollected.toLocaleString("en-IN")}`,
        icon: IndianRupee,
        color: "bg-emerald-500/10 text-emerald-400",
      },
      {
        title: "UPI Collections",
        value: `₹${upiTotal.toLocaleString("en-IN")}`,
        icon: Wallet,
        color: "bg-sky-500/10 text-sky-400",
      },
      {
        title: "Bank / Card",
        value: `₹${bankTotal.toLocaleString("en-IN")}`,
        icon: Landmark,
        color: "bg-amber-500/10 text-amber-400",
      },
    ];
  }, [paymentRecords]);

  // Filter Payments
  const filteredPayments = useMemo(() => {
    return paymentRecords.filter(
      (p) =>
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.customer.toLowerCase().includes(search.toLowerCase()) ||
        p.method.toLowerCase().includes(search.toLowerCase())
    );
  }, [paymentRecords, search]);

  const exportPaymentsCSV = () => {
    if (filteredPayments.length === 0) return alert("No payments to export.");

    const headers = ["Transaction / Invoice ID", "Customer", "Method", "Amount Paid", "Date", "Status"];
    const rows = filteredPayments.map((p) => [
      p.id,
      `"${p.customer}"`,
      p.method,
      p.amount,
      p.date,
      p.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Payments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments & Settlements</h1>
          <p className="mt-1 text-slate-400">
            Real-time breakdown of all received customer transactions.
          </p>
        </div>

        <button
          onClick={exportPaymentsCSV}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition cursor-pointer"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className={`inline-flex rounded-xl p-3 ${item.color}`}>
                <Icon size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">
                {loading ? "..." : item.value}
              </h2>
              <p className="text-sm text-slate-400">{item.title}</p>
            </div>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search payments by invoice ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-white outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Receipt size={36} className="mb-3 text-slate-600" />
            <h3 className="text-lg font-semibold text-white">No payment records found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              {search
                ? "No payment matches your search query."
                : "Payments will appear here automatically when customer invoices are marked as paid or partially paid."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-800 bg-slate-800/40">
              <tr className="text-left text-xs font-semibold uppercase text-slate-400">
                <th className="p-4">Invoice ID</th>
                <th>Customer</th>
                <th>Payment Mode</th>
                <th>Amount Collected</th>
                <th>Date Settled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-slate-800/30 transition"
                >
                  <td className="p-4 font-mono font-medium text-indigo-400">
                    {payment.id}
                  </td>
                  <td className="font-medium text-white">{payment.customer}</td>
                  <td>
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                      {payment.method}
                    </span>
                  </td>
                  <td className="font-bold text-emerald-400">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="text-slate-400 text-xs">{payment.date}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        payment.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {payment.status}
                    </span>
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