const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchExpenses = async (token) => {
  const res = await fetch(`${API_BASE}/api/expenses`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
};

export const createExpense = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/expenses`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to record expense");
  }
  return res.json();
};

export const updateExpense = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
};

export const deleteExpense = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete expense");
  return res.json();
};
