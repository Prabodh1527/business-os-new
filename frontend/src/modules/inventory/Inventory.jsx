import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:5000';

const API_URL = `${API_BASE}/api/inventory`;

const INITIAL_FORM = {
  sku: '',
  name: '',
  category: 'Hardware',
  unitPrice: 0,
  taxRate: 18,
  stockQuantity: 10,
  minStockThreshold: 5,
};

// Helper: Recursively locates the item array anywhere inside the JSON response
const findArrayInObject = (obj) => {
  if (Array.isArray(obj)) return obj;
  if (typeof obj !== 'object' || obj === null) return [];
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) return obj[key];
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nested = findArrayInObject(obj[key]);
      if (nested && nested.length > 0) return nested;
    }
  }
  return [];
};

export default function Inventory() {
  const { token, signOut } = useAuth ? useAuth() : {};

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const clearAuthAndRedirect = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('business-os-auth');
    sessionStorage.removeItem('business-os-auth');
    if (signOut) signOut();
  }, [signOut]);

  const getActiveToken = useCallback(() => {
    if (token) return token;
    const rawToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (rawToken) return rawToken;

    const authData = localStorage.getItem('business-os-auth') || sessionStorage.getItem('business-os-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.token || parsed.accessToken || parsed.user?.token || null;
      } catch (e) {
        console.error('Error parsing session auth storage:', e);
      }
    }
    return null;
  }, [token]);

  const getAuthHeaders = useCallback(() => {
    const activeToken = getActiveToken();
    const headers = { 'Content-Type': 'application/json' };
    if (activeToken) {
      const cleanToken = activeToken.replace(/^Bearer\s+/i, '');
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }
    return headers;
  }, [getActiveToken]);

  const fetchInventory = useCallback(async () => {
    const activeToken = getActiveToken();

    if (!activeToken) {
      setErrorMessage('No authentication token found. Please sign in to access inventory.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const res = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        clearAuthAndRedirect();
        setErrorMessage('Session expired or unauthorized signature. Please re-login.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('GET /api/inventory response:', data);

      if (data.success || res.ok) {
        // Automatically find array regardless of how deeply nested it is
        const rawItems = findArrayInObject(data);

        // Map backend schema fields to UI properties
        const normalized = rawItems.map((item) => ({
          ...item,
          sku: item.sku || item.skuCode || item.code || 'N/A',
          name: item.name || item.productName || item.itemName || item.title || 'Unnamed Item',
          category: item.category || 'General',
          unitPrice: Number(item.unitPrice ?? item.price ?? item.cost ?? 0),
          stockQuantity: Number(item.stockQuantity ?? item.stock ?? item.quantity ?? item.qty ?? 0),
          minStockThreshold: Number(item.minStockThreshold ?? item.lowStockLimit ?? item.reorderPoint ?? 5),
        }));

        setItems(normalized);

        const totalVal = normalized.reduce(
          (acc, curr) => acc + Number(curr.unitPrice) * Number(curr.stockQuantity),
          0
        );
        const lowCount = normalized.filter(
          (i) => i.stockQuantity > 0 && i.stockQuantity <= (i.minStockThreshold || 5)
        ).length;
        const outCount = normalized.filter((i) => i.stockQuantity <= 0).length;

        setStats({
          totalItems: normalized.length,
          totalValue: totalVal,
          lowStockCount: lowCount,
          outOfStockCount: outCount,
        });
      } else {
        setErrorMessage(data.message || 'Failed to fetch inventory items.');
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setErrorMessage(`Unable to reach backend server at ${API_BASE}. Ensure server is running.`);
    } finally {
      setLoading(false);
    }
  }, [getActiveToken, getAuthHeaders, clearAuthAndRedirect]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id || item.id);
    setFormData({
      sku: item.sku || '',
      name: item.name || '',
      category: item.category || 'Hardware',
      unitPrice: item.unitPrice ?? 0,
      taxRate: item.taxRate ?? 18,
      stockQuantity: item.stockQuantity ?? 0,
      minStockThreshold: item.minStockThreshold ?? 5,
    });
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const priceNum = Number(formData.unitPrice) || 0;
    const stockNum = Number(formData.stockQuantity) || 0;
    const minStockNum = Number(formData.minStockThreshold) || 0;
    const taxNum = Number(formData.taxRate) || 0;

    const payload = {
      sku: formData.sku,
      skuCode: formData.sku,
      name: formData.name,
      productName: formData.name,
      category: formData.category,
      unitPrice: priceNum,
      price: priceNum,
      taxRate: taxNum,
      stockQuantity: stockNum,
      stock: stockNum,
      quantity: stockNum,
      minStockThreshold: minStockNum,
      lowStockLimit: minStockNum,
    };

    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        clearAuthAndRedirect();
        alert('Session expired. Please log in again.');
        return;
      }

      const data = await res.json();
      if (data.success || res.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData(INITIAL_FORM);
        await fetchInventory();
      } else {
        alert(data.message || 'Failed to save product.');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Network error while saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product from inventory?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        clearAuthAndRedirect();
        alert('Session expired. Please log in again.');
        return;
      }

      const data = await res.json();
      if (data.success || res.ok) {
        fetchInventory();
      } else {
        alert(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 text-slate-100 bg-[#0B0F19] min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventory & Stock</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time SKU tracking, automated stock alerts, and catalog management.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-lg leading-none">+</span> Add Product
        </button>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex justify-between items-center">
          <span>{errorMessage}</span>
          <div className="flex items-center gap-2">
            <a
              href="/login"
              onClick={() => clearAuthAndRedirect()}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition"
            >
              Re-Login
            </a>
            <button
              onClick={fetchInventory}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-sm">
          <p className="text-slate-400 text-xs font-medium">Total Products</p>
          <h2 className="text-2xl font-bold text-white mt-1">{stats.totalItems || items.length || 0}</h2>
        </div>
        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-sm">
          <p className="text-slate-400 text-xs font-medium">Total Inventory Value</p>
          <h2 className="text-2xl font-bold text-emerald-400 mt-1">
            ₹{(stats.totalValue || 0).toLocaleString('en-IN')}
          </h2>
        </div>
        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-sm">
          <p className="text-slate-400 text-xs font-medium">Low Stock Warnings</p>
          <h2 className="text-2xl font-bold text-amber-400 mt-1">{stats.lowStockCount || 0}</h2>
        </div>
        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-sm">
          <p className="text-slate-400 text-xs font-medium">Out of Stock</p>
          <h2 className="text-2xl font-bold text-rose-400 mt-1">{stats.outOfStockCount || 0}</h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 mb-6">
        <input
          type="text"
          placeholder="Search product by name, SKU, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 bg-[#1A2234] border border-slate-700 px-4 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Product Data Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading catalog...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {errorMessage ? 'Failed to load products.' : 'No products found in inventory.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-[#161F32]">
                  <th className="py-3.5 px-5 font-semibold">SKU</th>
                  <th className="py-3.5 px-5 font-semibold">Product Name</th>
                  <th className="py-3.5 px-5 font-semibold">Category</th>
                  <th className="py-3.5 px-5 font-semibold">Unit Price</th>
                  <th className="py-3.5 px-5 font-semibold">Stock Quantity</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item, idx) => (
                  <tr key={item._id || item.id || item.sku || idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-5 font-mono text-indigo-400">{item.sku}</td>
                    <td className="py-4 px-5 font-medium text-white">{item.name}</td>
                    <td className="py-4 px-5 text-slate-400">{item.category}</td>
                    <td className="py-4 px-5 font-semibold text-slate-200">
                      ₹{item.unitPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-100">{item.stockQuantity} units</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          item.stockQuantity <= 0
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : item.stockQuantity <= (item.minStockThreshold || 5)
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {item.stockQuantity <= 0
                          ? 'OUT OF STOCK'
                          : item.stockQuantity <= (item.minStockThreshold || 5)
                          ? 'LOW STOCK'
                          : 'IN STOCK'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-indigo-400 hover:text-indigo-300 transition text-xs cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        className="text-rose-400 hover:text-rose-300 transition text-xs cursor-pointer font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Product' : 'Add Product to Inventory'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROD-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Services, Hardware"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Product / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Web Development Package"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Low-Stock Alert Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockThreshold}
                    onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
                    className="w-full bg-[#1A2234] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-white font-medium cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}