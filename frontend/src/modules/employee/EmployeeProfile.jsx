import { useCallback, useEffect, useState } from "react";
import {
  Save,
  UserCircle2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchMyEmployeeProfile, updateMyEmployeeProfile } from "@/api/employees.api";
import { updatePasswordApi } from "@/api/auth.api";

export default function EmployeeProfile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.jobTitle || "Employee",
    department: user?.department || "",
    employeeId: user?.employeeId || "",
    joiningDate: user?.joinDate || "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const response = await fetchMyEmployeeProfile(token);
      const employee = response.employee || response.data;
      setProfile({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        role: employee.role || "Employee",
        department: employee.department || "",
        employeeId: employee.employeeId || "",
        joiningDate: employee.joinDate || "",
        emergencyName: employee.emergencyName || "",
        emergencyPhone: employee.emergencyPhone || "",
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load employee profile.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateMyEmployeeProfile({
        phone: profile.phone,
        emergencyName: profile.emergencyName,
        emergencyPhone: profile.emergencyPhone,
      }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      setError(saveError.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const response = await updatePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, token);
      if (!response.success) {
        setPasswordError(response.message || "Unable to update password.");
        return;
      }
      setPasswordSaved(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (passwordRequestError) {
      setPasswordError(passwordRequestError.message || "Unable to update password.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          My Staff Profile
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your personal details, shift assignment parameters, and account security.
        </p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
              <UserCircle2 size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  {profile.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile.role} • {profile.department || "Department not set"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs text-slate-300 self-start sm:self-auto">
            <span className="text-slate-500">Employment Status:</span>
            <span className="ml-2 font-semibold text-emerald-400">{loading ? "Loading…" : "Active"}</span>
          </div>
        </div>
      </div>

      {/* Form Tabs Layout */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Personal Details Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-white mb-6">
            <Briefcase size={20} className="text-emerald-400" />
            <h3 className="text-lg font-semibold">Personal & Work Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-300">Full Legal Name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Work Email (Login)</label>
                <input
                  value={profile.email}
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-300">Contact Phone Number</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Department</label>
                <input
                  value={profile.department}
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-300">Assigned Shift Schedule</label>
                <input
                  value="Managed by your business owner"
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Date of Joining</label>
                <input
                  value={profile.joiningDate}
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-slate-300">Emergency Contact</label>
              <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Emergency contact name"
                  value={profile.emergencyName}
                  onChange={(e) => setProfile({ ...profile, emergencyName: e.target.value })}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
                <input
                  placeholder="Emergency phone"
                  value={profile.emergencyPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {saved && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 size={15} /> Profile changes saved successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-950/30"
            >
              <Save size={15} />
              <span>{saving ? "Saving…" : "Save Contact Info"}</span>
            </button>
          </form>
        </div>

        {/* Security & Change Password Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-white mb-6">
              <KeyRound size={20} className="text-indigo-400" />
              <h3 className="text-lg font-semibold">Account Security</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Logged in using a temporary password? Update it here to a permanent, secure personal password.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300">
                  Current / Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={14} /> {passwordError}
                </p>
              )}

              {passwordSaved && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Password updated successfully!
                </p>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-md shadow-indigo-950/30 mt-2"
              >
                <Lock size={15} />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            For role promotions or department transfers, consult your business administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
