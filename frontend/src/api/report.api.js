const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchReportSummary = async (token) => {
  const res = await fetch(`${API_BASE}/api/reports/summary`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch report summary");
  return res.json();
};
