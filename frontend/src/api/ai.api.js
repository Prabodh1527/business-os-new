const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchAIHealth = async (token) => {
  const res = await fetch(`${API_BASE}/api/ai/health`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch AI health analysis");
  return res.json();
};

export const fetchAIInsights = async (token) => {
  const res = await fetch(`${API_BASE}/api/ai/insights`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch AI insights");
  return res.json();
};

export const sendAIChat = async (message, token) => {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to query AI assistant");
  return res.json();
};
