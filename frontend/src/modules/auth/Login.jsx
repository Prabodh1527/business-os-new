import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";

const presetRoles = [
  {
    id: "OWNER",
    label: "Owner Login",
    badge: "Business Owner",
    description: "Owners and administrators",
  },
  {
    id: "EMPLOYEE",
    label: "Employee Login",
    badge: "Staff Portal",
    description: "Staff, team members and shift workers",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signIn } = useAuth();

  // Determine initial mode from query params (?role=employee or ?mode=employee)
  const roleQuery = searchParams.get("role") || searchParams.get("mode") || searchParams.get("portal");
  const initialMode =
    roleQuery?.toUpperCase() === "EMPLOYEE" || roleQuery?.toUpperCase() === "STAFF"
      ? "EMPLOYEE"
      : "OWNER";

  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [rememberEmail, setRememberEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [roleMismatchHint, setRoleMismatchHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCredsHelp, setShowCredsHelp] = useState(false);

  // Sync mode if query param changes
  useEffect(() => {
    if (roleQuery?.toUpperCase() === "EMPLOYEE" || roleQuery?.toUpperCase() === "STAFF") {
      setMode("EMPLOYEE");
    }
  }, [roleQuery]);

  // Load remembered email for active mode
  useEffect(() => {
    const storageKey = mode === "EMPLOYEE" ? "bos_saved_employee_email" : "bos_saved_owner_email";
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setForm((prev) => ({ ...prev, email: saved }));
    } else {
      setForm((prev) => ({ ...prev, email: "" }));
    }
    setError("");
    setRoleMismatchHint(false);
  }, [mode]);

  const handleRoleSwitch = (newRole) => {
    setMode(newRole);
    setError("");
    setRoleMismatchHint(false);
    setSearchParams(newRole === "EMPLOYEE" ? { role: "employee" } : {});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setRoleMismatchHint(false);
    setLoading(true);

    // Save or clear remembered email
    const storageKey = mode === "EMPLOYEE" ? "bos_saved_employee_email" : "bos_saved_owner_email";
    if (rememberEmail && form.email.trim()) {
      localStorage.setItem(storageKey, form.email.trim());
    } else {
      localStorage.removeItem(storageKey);
    }

    try {
      const result = await signIn({
        email: form.email.trim(),
        password: form.password,
        role: mode,
      });

      if (!result || !result.success) {
        const errorMsg = result?.message || "Invalid email or password.";
        setError(errorMsg);

        // Detect if user likely has wrong role selected
        if (
          errorMsg.toLowerCase().includes("not have access to this portal") ||
          errorMsg.toLowerCase().includes("role")
        ) {
          setRoleMismatchHint(true);
        }
        setLoading(false);
        return;
      }

      const userRole = result.user?.role?.toUpperCase() || mode;
      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
        return;
      }

      const targetPath = userRole === "EMPLOYEE" ? "/employee/dashboard" : "/dashboard";
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStaffPreview = async () => {
    try {
      const demoStaff = {
        _id: "demo_staff_user",
        name: "Staff Member",
        email: "staff@business.com",
        role: "EMPLOYEE",
        department: "Operations",
        employeeId: "EMP-001",
      };
      const previewToken = "preview_staff_token_" + Date.now();
      localStorage.setItem("token", previewToken);
      localStorage.setItem("user", JSON.stringify(demoStaff));
      localStorage.setItem(
        "business-os-auth",
        JSON.stringify({ ...demoStaff, token: previewToken })
      );
      navigate("/employee/dashboard", { replace: true });
    } catch (err) {
      navigate("/employee/dashboard", { replace: true });
    }
  };

  const isEmployee = mode === "EMPLOYEE";

  return (
    <AuthLayout
      mode={mode}
      title={isEmployee ? "Staff Sign In" : "Welcome back"}
      subtitle={
        isEmployee
          ? "Access your shift schedule, clock in attendance, request leaves, and view payslips."
          : "Sign in to continue managing your business from one place."
      }
    >
      {/* Role Switcher Tabs */}
      <div className="mb-6 flex rounded-2xl border border-slate-800 bg-slate-950/80 p-1.5 shadow-inner">
        {presetRoles.map((item) => {
          const isSelected = mode === item.id;
          const isItemEmployee = item.id === "EMPLOYEE";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleRoleSwitch(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? isItemEmployee
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {isItemEmployee ? (
                <ShieldCheck size={16} className={isSelected ? "text-emerald-200" : "text-slate-400"} />
              ) : (
                <Building2 size={16} className={isSelected ? "text-indigo-200" : "text-slate-400"} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Login Card */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`rounded-2xl border ${
            isEmployee
              ? "border-emerald-500/25 bg-emerald-950/15"
              : "border-slate-800 bg-slate-950/50"
          } p-4 sm:p-5 transition-all duration-300`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-sm sm:text-base">
                {isEmployee ? "Employee Staff Account" : "Owner Workspace"}
              </p>
              <p className="text-xs text-slate-400">
                {isEmployee
                  ? "Staff member, manager, or shift specialist"
                  : "Business owner and full workspace administrator"}
              </p>
            </div>
            <div
              className={`rounded-xl p-2 ${
                isEmployee
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}
            >
              {isEmployee ? <UserCheck size={18} /> : <Building2 size={18} />}
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                {isEmployee ? "Registered Staff Email" : "Registered Business Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-${
                    isEmployee ? "emerald" : "indigo"
                  }-500`}
                  placeholder={isEmployee ? "staff.member@company.com" : "owner@business.com"}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {isEmployee ? (
                  <button
                    type="button"
                    onClick={() => setShowCredsHelp(!showCredsHelp)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <HelpCircle size={12} />
                    Need temporary password?
                  </button>
                ) : (
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-${
                    isEmployee ? "emerald" : "indigo"
                  }-500`}
                  placeholder="Enter your account password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Email Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
                Remember my email
              </label>

              {isEmployee && (
                <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-slate-200">
                  Reset password
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Credentials Help Drawer for Employees */}
        {isEmployee && showCredsHelp && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-200 space-y-2.5">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">How Staff Logins Work</p>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  When your employer registers you in the Business OS, a temporary password is generated.
                  If the automatic welcome email hasn't reached your inbox yet, please ask your workspace administrator to share your temporary password, or use the instant preview below.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <p className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
                Ask your workspace admin for the temporary login password or request a reset if needed.
              </p>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle size={17} className="shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-rose-200">{error}</p>

              {/* Role mismatch auto-fix suggestion */}
              {roleMismatchHint && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-center justify-between">
                  <span className="text-rose-300">
                    {isEmployee ? "Trying to log in as Business Owner?" : "Is this an employee or staff account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch(isEmployee ? "OWNER" : "EMPLOYEE")}
                    className="font-semibold text-white underline hover:no-underline ml-2"
                  >
                    Switch to {isEmployee ? "Owner" : "Employee"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition duration-200 disabled:opacity-50 ${
            isEmployee
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
              : "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/40"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            <>
              <span>{isEmployee ? "Enter Staff Portal" : "Continue to Dashboard"}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Quick Testing Bypass for Employee Login */}
        {isEmployee && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickStaffPreview}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 py-2.5 text-xs font-medium text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-500/50 transition"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>Preview Staff Portal directly (Instant Access)</span>
            </button>
          </div>
        )}
      </form>

      {/* Footer Links */}
      <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
        <Link to="/forgot-password" className="hover:text-white transition">
          Trouble signing in?
        </Link>

        {/* Only show 'Create account' on OWNER login tab */}
        {mode === "OWNER" ? (
          <Link to="/register" className="hover:text-white font-medium text-indigo-300 transition">
            Create new workspace
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowCredsHelp(true)}
            className="hover:text-emerald-300 text-emerald-400 transition"
          >
            First time staff help
          </button>
        )}
      </div>
    </AuthLayout>
  );
}