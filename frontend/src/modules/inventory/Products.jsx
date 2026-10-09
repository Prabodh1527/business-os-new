import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchInventory, deleteProduct } from "@/api/inventory.api";

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadData = async () => {
    try {
      if (token) {
        const res = await fetchInventory(token);
        if (res.success) {
          setProducts(res.inventory || res.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete product "${name}" from inventory?`)) {
      try {
        await deleteProduct(id, token);
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        alert(err.message || "Failed to delete product");
      }
    }
  };

  // Derive unique categories for the filter dropdown
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "General"));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // Live KPI Calculations
  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (p) =>
      Number(p.quantity ?? p.stockQuantity ?? 0) <=
      Number(p.minStockThreshold ?? p.reorderLevel ?? 5)
  ).length;
  const totalInventoryValue = products.reduce((acc, curr) => {
    const qty = Number(curr.quantity ?? curr.stockQuantity ?? 0);
    const price = Number(curr.price ?? curr.unitPrice ?? 0);
    return acc + qty * price;
  }, 0);

  // Search & Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" || (p.category || "General") === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Products & Inventory</h1>
          <p className="mt-1 text-slate-400">
            Manage your retail stock, service items, and suppliers.
          </p>
        </div>

        <Link
          to="/inventory/create"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 transition"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
              <Package size={20} />
            </div>
            <span className="text-xs text-slate-400">Catalog Count</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {loading ? "..." : totalProducts}
          </h2>
          <p className="text-sm text-slate-400">Total Products</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs text-amber-400">
              {lowStockCount > 0 ? "Action Required" : "Healthy"}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {loading ? "..." : lowStockCount}
          </h2>
          <p className="text-sm text-slate-400">Low Stock Alerts</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Package size={20} />
            </div>
            <span className="text-xs text-emerald-400">Asset Valuation</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {loading ? "..." : `₹${totalInventoryValue.toLocaleString("en-IN")}`}
          </h2>
          <p className="text-sm text-slate-400">Total Inventory Value</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, or supplier..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-white outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / Empty State */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading inventory catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Package size={36} className="mb-3 text-slate-600" />
            <h3 className="text-lg font-semibold text-white">No products found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              {search
                ? "No product matches your search filter."
                : "You haven't added any products to your inventory catalog yet."}
            </p>
            {!search && (
              <Link
                to="/inventory/create"
                className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <Plus size={16} /> Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-800 bg-slate-800/40">
              <tr className="text-left text-sm text-slate-400">
                <th className="p-4">SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit Price</th>
                <th>Supplier</th>
                <th>Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const qty = Number(product.quantity ?? product.stockQuantity ?? 0);
                const threshold = Number(product.minStockThreshold ?? product.reorderLevel ?? 5);
                const isOutOfStock = qty <= 0;
                const isLowStock = !isOutOfStock && qty <= threshold;

                return (
                  <tr
                    key={product._id}
                    className="border-b border-slate-800 hover:bg-slate-800/30 transition"
                  >
                    <td className="p-4 font-mono text-xs text-indigo-400">
                      {product.sku || "—"}
                    </td>

                    <td className="font-medium text-white">
                      {product.name}
                    </td>

                    <td className="text-slate-400">{product.category || "General"}</td>

                    <td className="font-bold text-slate-200">
                      {qty} units
                    </td>

                    <td className="text-white font-medium">
                      ₹{Number(product.price ?? product.unitPrice ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="text-slate-400">{product.supplier || "—"}</td>

                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isOutOfStock
                            ? "bg-rose-500/10 text-rose-400"
                            : isLowStock
                            ? "bg-amber-500/10 text-amber-400 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : isLowStock
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </td>

                    <td className="text-right p-4">
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="rounded-lg border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}