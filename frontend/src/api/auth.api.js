const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const loginApi = async (credentials) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
};

export const registerApi = async (data) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const forgotPasswordApi = async (email) => {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPasswordApi = async (data) => {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updatePasswordApi = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/auth/update-password`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteAccountApi = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/auth/account`, {
    method: "DELETE",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
};
