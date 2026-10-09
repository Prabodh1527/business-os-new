const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchPurchaseOrders = async (token) => {
  const res = await fetch(`${API_BASE}/api/purchase-orders`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  return res.json();
};

export const createPurchaseOrder = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/purchase-orders`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create purchase order");
  }
  return res.json();
};

export const updatePurchaseOrder = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/purchase-orders/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update purchase order");
  return res.json();
};

export const deletePurchaseOrder = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/purchase-orders/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete purchase order");
  return res.json();
};
