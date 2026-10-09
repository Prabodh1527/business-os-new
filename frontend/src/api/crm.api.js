// frontend/src/api/crm.api.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchCustomers = async (token) => {
  const response = await fetch(`${API_BASE}/api/customers`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch customers");
  return response.json();
};

export const fetchCustomerById = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/customers/${id}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch customer profile");
  return response.json();
};

export const createCustomer = async (data, token) => {
  const response = await fetch(`${API_BASE}/api/customers`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create customer");
  }
  return response.json();
};

export const updateCustomer = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/api/customers/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update customer");
  return response.json();
};

export const deleteCustomer = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/customers/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to delete customer");
  return response.json();
};