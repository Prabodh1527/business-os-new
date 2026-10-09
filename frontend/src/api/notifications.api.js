const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchNotifications = async (token) => {
  const res = await fetch(`${API_BASE}/api/notifications`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const createNotification = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/notifications`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create notification");
  return res.json();
};

export const markNotificationRead = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to mark notification read");
  return res.json();
};

export const markAllNotificationsRead = async (token) => {
  const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
    method: "PATCH",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to mark all read");
  return res.json();
};

export const deleteNotification = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
};

export const clearAllNotifications = async (token) => {
  const res = await fetch(`${API_BASE}/api/notifications/clear-all`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to clear notifications");
  return res.json();
};
