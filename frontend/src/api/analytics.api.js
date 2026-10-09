// frontend/src/api/analytics.api.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

export const fetchDashboardAnalytics = async (token) => {
  const response = await fetch(`${API_BASE}/api/analytics`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard analytics");
  }

  return response.json();
};