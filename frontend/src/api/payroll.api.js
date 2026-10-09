const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export const fetchPayroll = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/payroll${query ? `?${query}` : ""}`;
  const res = await fetch(url, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch payroll records");
  return res.json();
};

export const fetchPayrollRules = async (token) => {
  const res = await fetch(`${API_BASE}/api/payroll/rules`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch payroll rules");
  return res.json();
};

export const updatePayrollRules = async (rules, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/rules`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(rules),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update payroll rules");
  }
  return res.json();
};

export const calculatePayroll = async (month, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/calculate`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ month }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to calculate payroll");
  }
  return res.json();
};

export const recalculatePayrollRecord = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}/recalculate`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to adjust payroll record");
  }
  return res.json();
};

export const approvePayroll = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}/approve`, {
    method: "POST",
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to approve payroll");
  }
  return res.json();
};

export const markPayrollPaid = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}/pay`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to mark payroll as paid");
  }
  return res.json();
};

export const sendPayslipEmail = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}/send`, {
    method: "POST",
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to deliver payslip email");
  }
  return res.json();
};

export const downloadPayslipPdf = async (id, filename, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}/payslip`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  if (!res.ok) throw new Error("Failed to generate payslip PDF");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `Payslip_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const createPayroll = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/payroll`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create payroll entry");
  }
  return res.json();
};

export const updatePayroll = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update payroll");
  return res.json();
};

export const deletePayroll = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/payroll/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete payroll entry");
  return res.json();
};
