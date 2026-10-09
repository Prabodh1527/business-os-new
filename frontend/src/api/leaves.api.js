const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchLeaves = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/leaves${query ? `?${query}` : ""}`;
  const res = await fetch(url, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch leaves");
  return res.json();
};

export const fetchLeavePolicy = async (token) => {
  const res = await fetch(`${API_BASE}/api/leaves/policy`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch leave policy");
  return res.json();
};

export const updateLeavePolicy = async (policy, token) => {
  const res = await fetch(`${API_BASE}/api/leaves/policy`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(policy),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update leave policy");
  }
  return res.json();
};

export const fetchLeaveBalance = async (employeeId, token) => {
  const res = await fetch(`${API_BASE}/api/leaves/balance/${employeeId}`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch employee leave balance");
  return res.json();
};

export const submitLeave = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/leaves`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to submit leave request");
  }
  return res.json();
};

export const updateLeaveStatus = async (id, status, rejectionReason = "", token) => {
  const res = await fetch(`${API_BASE}/api/leaves/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ status, rejectionReason }),
  });
  if (!res.ok) throw new Error("Failed to update leave request");
  return res.json();
};

export const deleteLeave = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/leaves/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete leave request");
  return res.json();
};
