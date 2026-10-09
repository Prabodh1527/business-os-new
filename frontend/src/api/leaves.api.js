const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchLeaves = async (token) => {
  const res = await fetch(`${API_BASE}/api/leaves`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch leaves");
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

export const updateLeaveStatus = async (id, status, token) => {
  const res = await fetch(`${API_BASE}/api/leaves/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ status }),
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
