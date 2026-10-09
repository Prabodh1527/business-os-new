import Employee from "../models/employee.model.js";

export const isEmployeeUser = (req) =>
  req.user?.role?.toUpperCase() === "EMPLOYEE";

export const getEmployeeIdentity = async (req) => {
  if (!isEmployeeUser(req)) return null;

  const employee = await Employee.findOne({
    tenantId: req.tenantId,
    $or: [
      ...(req.user?.employeeId ? [{ employeeId: req.user.employeeId }] : []),
      ...(req.user?.email ? [{ email: req.user.email.toLowerCase() }] : []),
    ],
  }).lean();

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

export const employeeAssignmentFilter = (identity) => ({
  $or: [
    ...(identity.employeeId ? [{ assignedTo: identity.employeeId }] : []),
    ...(identity.name ? [{ assignedTo: identity.name }] : []),
    ...(identity.email ? [{ assignedToEmail: identity.email }] : []),
  ],
});
