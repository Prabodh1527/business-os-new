import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, KeyRound, Eye, EyeOff, RotateCw } from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Step 1: Request OTP from backend
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP. Ensure this email is registered.");
        return;
      }

      setMessage(data.message || "OTP sent to your registered Gmail address.");
      setStep(2);
    } catch (err) {
      console.error("OTP send error:", err);
      setError("Unable to connect to the server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger (Step 2)
  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }

      setMessage("A new OTP code has been sent to your email!");
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP code or password reset failed.");
        return;
      }

      setMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We’ll help you get back into your workspace quickly."
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            {message}
          </div>
        ) : null}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="mb-4 flex items-center gap-3 text-slate-300">
                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">Email recovery</p>
                  <p className="text-sm text-slate-400">
                    Enter your registered Gmail address to receive an OTP code.
                  </p>
                </div>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="Work email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Sending reset OTP..." : "Send reset link"}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Verification & New Password</p>
                    <p className="text-sm text-slate-400">Sent code to {email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  <RotateCw size={12} className={resending ? "animate-spin" : ""} />
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              {/* OTP Code Field */}
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white tracking-widest outline-none focus:border-indigo-500"
                placeholder="6-digit OTP"
              />

              {/* New Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-3 pr-10 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Updating password..." : "Reset Password"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="flex items-center justify-between mt-5 text-sm">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setMessage("");
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              ← Change Email
            </button>
          ) : <div />}

          <p className="text-slate-400">
            Remembered it?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}