export const formatCurrency = (amount, currency = "INR") => {
  const num = Number(amount || 0);
  if (currency === "INR") {
    return `₹${num.toLocaleString("en-IN")}`;
  }
  return `$${num.toLocaleString("en-US")}`;
};

export const parseCurrency = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return Number(val.replace(/[^0-9.-]+/g, "")) || 0;
};
