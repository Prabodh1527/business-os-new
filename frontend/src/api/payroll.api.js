const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchPayroll = async (token) => {
  const res = await fetch(`${API_BASE}/api/payroll`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch payroll records");
  return res.json();
};

export const createPayroll = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/payroll`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create payroll entry");
  }
  return res.json();
};

export const updatePayroll = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update payroll");
  return res.json();
};

export const deletePayroll = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete payroll entry");
  return res.json();
};
