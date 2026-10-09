export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
};

export const canManageTeam = (role) => {
  const r = (role || "").toUpperCase();
  return r === ROLES.OWNER || r === ROLES.ADMIN || r === ROLES.MANAGER;
};

export const canViewFinancials = (role) => {
  const r = (role || "").toUpperCase();
  return r === ROLES.OWNER || r === ROLES.ADMIN;
};
