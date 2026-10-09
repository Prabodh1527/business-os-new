// frontend/src/api/employees.api.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchEmployees = async (token) => {
  const response = await fetch(`${API_BASE}/api/employees`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch employees");
  return response.json();
};

export const fetchEmployeeById = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/employees/${id}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch employee details");
  return response.json();
};

export const fetchMyEmployeeProfile = async (token) => {
  const response = await fetch(`${API_BASE}/api/employees/me`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch employee profile");
  return response.json();
};

export const updateMyEmployeeProfile = async (data, token) => {
  const response = await fetch(`${API_BASE}/api/employees/me`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update employee profile");
  }
  return response.json();
};

export const createEmployee = async (data, token) => {
  const response = await fetch(`${API_BASE}/api/employees`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to add employee");
  }
  return response.json();
};

export const updateEmployee = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/api/employees/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update employee");
  return response.json();
};

export const deleteEmployee = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/employees/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to delete employee");
  return response.json();
};