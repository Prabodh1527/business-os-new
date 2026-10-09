import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user: contextUser, loading } = useAuth();

  // 1. Fallback user resolution: check AuthContext first, then localStorage/sessionStorage
  const getStoredUser = () => {
    if (contextUser) return contextUser;

    const authData =
      localStorage.getItem("business-os-auth") ||
      sessionStorage.getItem("business-os-auth") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.user || parsed;
      } catch (e) {
        console.error("Error parsing stored user data:", e);
      }
    }
    return null;
  };

  const user = getStoredUser();

  // 2. Show loading state while checking session
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300 font-medium">
        Loading your workspace…
      </div>
    );
  }

  // 3. Redirect unauthenticated users back to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Prevent unauthorized roles from entering restricted routes (case-insensitive check)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || "OWNER").toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      const defaultRolePath = userRole === "EMPLOYEE" ? "/employee/dashboard" : "/dashboard";
      return <Navigate to={defaultRolePath} replace />;
    }
  }

  // 5. Render children or nested router <Outlet /> wrapper
  return children ? children : <Outlet />;
}