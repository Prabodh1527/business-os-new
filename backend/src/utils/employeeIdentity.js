import Employee from "../models/employee.model.js";

export const isEmployeeUser = (req) =>
  req.user?.role?.toUpperCase() === "EMPLOYEE";

export const getEmployeeIdentity = async (req) => {
  if (!isEmployeeUser(req)) return null;

  const orQueries = [
    ...(req.user?.employeeId ? [{ employeeId: req.user.employeeId }] : []),
    ...(req.user?.email ? [{ email: req.user.email.toLowerCase() }] : []),
    ...(req.user?.name ? [{ name: req.user.name }] : []),
  ];

  let employee = null;
  if (orQueries.length > 0) {
    employee = await Employee.findOne({
      tenantId: req.tenantId,
      $or: orQueries,
    }).lean();
  }

  // If user has EMPLOYEE role but no standalone Employee record was found, provide synthesized fallback
  if (!employee && req.user) {
    employee = {
      _id: req.user._id,
      employeeId: req.user.employeeId || `EMP-${req.user._id.toString().slice(-4).toUpperCase()}`,
      name: req.user.name || "Employee",
      email: req.user.email || "",
      role: req.user.jobTitle || "Staff",
      department: req.user.department || "Operations",
      phone: req.user.phone || "",
      joinDate: new Date().toISOString().slice(0, 10),
      salary: Number(req.user.salary || 0),
      status: "ACTIVE",
    };
  }

  return {
    employeeId: employee?.employeeId || req.user?.employeeId || "",
    name: employee?.name || req.user?.name || "",
    email: employee?.email || req.user?.email || "",
    role: employee?.role || req.user?.jobTitle || "Staff",
    department: employee?.department || req.user?.department || "",
    phone: employee?.phone || req.user?.phone || "",
    joinDate: employee?.joinDate || req.user?.joinDate || "",
    salary: Number(employee?.salary ?? req.user?.salary ?? 0),
    employee,
  };
};


export const employeeAssignmentFilter = (identity) => {
  if (!identity) return {};
  const orList = [
    ...(identity.employeeId ? [{ assignedTo: identity.employeeId }] : []),
    ...(identity.name ? [{ assignedTo: identity.name }] : []),
    ...(identity.email ? [{ assignedToEmail: identity.email }] : []),
  ];
  return orList.length > 0 ? { $or: orList } : {};
};

