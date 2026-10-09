const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchSuppliers = async (token) => {
  const res = await fetch(`${API_BASE}/api/suppliers`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
};

export const createSupplier = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/suppliers`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create supplier");
  }
  return res.json();
};

export const updateSupplier = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/suppliers/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update supplier");
  return res.json();
};

export const deleteSupplier = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/suppliers/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete supplier");
  return res.json();
};
