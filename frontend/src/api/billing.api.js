// frontend/src/api/billing.api.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchInvoices = async (token) => {
  const response = await fetch(`${API_BASE}/api/invoices`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return response.json();
};

export const fetchInvoiceById = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/invoices/${id}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch invoice details");
  return response.json();
};

export const createInvoice = async (data, token) => {
  const response = await fetch(`${API_BASE}/api/invoices`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate invoice");
  }
  return response.json();
};

export const recordInvoicePayment = async (id, amount, token) => {
  const response = await fetch(`${API_BASE}/api/invoices/${id}/payment`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to record payment");
  }
  return response.json();
};

export const updateInvoiceStatus = async (id, status, token) => {
  const response = await fetch(`${API_BASE}/api/invoices/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update status");
  return response.json();
};

export const deleteInvoice = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/invoices/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to delete invoice");
  return response.json();
};
