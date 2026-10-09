import axios from 'axios';

const rawBase = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const normalizedBase = rawBase.replace(/\/+$/, '');
const baseURL = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;

const API = axios.create({
  baseURL,
});

// Automatically inject JWT token into request headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized responses gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized or token expired. Redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;