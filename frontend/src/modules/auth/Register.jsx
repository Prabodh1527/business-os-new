import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Eye, EyeOff, ChevronDown } from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";

const ROLES = [
  { value: "OWNER", label: "Owner" },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "OWNER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Sending signup request with form:", form);

      const result = await signUp(form);

      // Only navigate if signup was successful
      if (result && result.success) {
        localStorage.setItem("business-os-onboarding", "pending");
        navigate("/onboarding", { replace: true });
      } else {
        setError(result?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Set up Business OS for your team in just a few steps."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Full Name */}
        <input
          required
          value={form.name}
          onChange={(event) =>
            setForm({
              ...form,
              name: event.target.value,
            })
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
          placeholder="Full name"
        />

        {/* Work Email */}
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm({
              ...form,
              email: event.target.value,
            })
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
          placeholder="Work email"
        />

        {/* Password with Eye toggle */}
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-3 pr-10 text-sm text-white outline-none focus:border-indigo-500"
            placeholder="Create password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Role Select Dropdown */}
        <div className="relative">
          <select
            value={form.role}
            onChange={(event) =>
              setForm({
                ...form,
                role: event.target.value,
              })
            }
            className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-3 pl-3 pr-10 text-sm text-white outline-none focus:border-indigo-500"
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value} className="bg-slate-900 text-white">
                {role.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          <Sparkles size={16} />
          {loading ? "Creating account..." : "Start onboarding"}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already have an account?
        <Link
          to="/login"
          className="ml-1 text-indigo-400 hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}