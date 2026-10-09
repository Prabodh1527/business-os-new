// frontend/src/api/inventory.api.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchInventory = async (token) => {
  const response = await fetch(`${API_BASE}/api/inventory`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch inventory items");
  return response.json();
};

export const fetchProductById = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/inventory/${id}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch product details");
  return response.json();
};

export const createProduct = async (data, token) => {
  const response = await fetch(`${API_BASE}/api/inventory`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create product");
  }
  return response.json();
};

export const updateProduct = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/api/inventory/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update product");
  }
  return response.json();
};

export const deleteProduct = async (id, token) => {
  const response = await fetch(`${API_BASE}/api/inventory/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to delete product");
  return response.json();
};