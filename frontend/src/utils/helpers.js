export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const truncate = (str, max = 30) => {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max)}...` : str;
};
