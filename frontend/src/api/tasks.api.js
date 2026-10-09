const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchTasks = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/tasks${query ? `?${query}` : ""}`;
  const res = await fetch(url, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const createTask = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create task");
  }
  return res.json();
};

export const updateTask = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};
