import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Security() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // ==============================
  // CHANGE PASSWORD
  // ==============================

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ==============================
  // DELETE ACCOUNT
  // ==============================

  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ==============================
  // PASSWORD CHANGE
  // ==============================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match!",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage({
        type: "error",
        text: "You are not logged in. Please log in again.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/update-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update password."
        );
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Password updated successfully!",
      });

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.message ||
          "Server error while updating password.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DELETE ACCOUNT
  // ==============================

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError(
        "Please enter your current password."
      );
      return;
    }

    if (deleteConfirmation !== "DELETE") {
      setDeleteError(
        'Please type "DELETE" to confirm.'
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setDeleteError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/account",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: deletePassword,
            confirmation: deleteConfirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete your account."
        );
      }

      // Clear authentication
      signOut();

      // Make sure any old auth data is removed
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("business-os-auth");
      sessionStorage.removeItem("business-os-auth");
      sessionStorage.removeItem("user");

      // Redirect to login
      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Delete account error:",
        err
      );

      setDeleteError(
        err.message ||
          "Unable to delete account. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">

      {/* ==========================================
          CHANGE PASSWORD
      ========================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl">

        <div className="mb-6 flex items-center space-x-3">

          <div className="rounded-xl bg-indigo-600/20 p-3 text-indigo-400">

            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>

          </div>

          <h2 className="text-xl font-semibold">
            Change Password
          </h2>

        </div>

        {/* Password message */}

        {message.text && (
          <div
            className={`mb-6 rounded-xl border p-4 ${
              message.type === "error"
                ? "border-red-800 bg-red-950/50 text-red-300"
                : "border-emerald-800 bg-emerald-950/50 text-emerald-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4"
        >

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-indigo-500"
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-indigo-500"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-indigo-500"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-800"
          >
            <span>
              {loading
                ? "Updating..."
                : "Update Password"}
            </span>
          </button>

        </form>
      </div>


      {/* ==========================================
          DANGER ZONE
      ========================================== */}

      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">

        <div className="flex items-start gap-4">

          {/* Icon */}

          <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400">

            <AlertTriangle size={22} />

          </div>


          <div className="flex-1">

            <h2 className="text-xl font-semibold text-white">
              Danger Zone
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Permanently delete your Business OS
              workspace and all associated business data.
            </p>


            {/* Delete button */}

            {!showDeleteSection && (
              <button
                type="button"
                onClick={() => {
                  setShowDeleteSection(true);
                  setDeleteError("");
                }}
                className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/40 px-4 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10"
              >
                <Trash2 size={17} />

                Delete Account
              </button>
            )}


            {/* Confirmation section */}

            {showDeleteSection && (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-slate-950 p-5">

                <div className="flex items-start gap-3">

                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-rose-400"
                  />

                  <div>

                    <h3 className="font-semibold text-white">
                      Permanently delete your workspace?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      This action will permanently delete
                      your owner account, business workspace,
                      employees, customers, invoices,
                      appointments, inventory and other
                      associated business data.
                    </p>

                    <p className="mt-2 text-sm font-medium text-rose-400">
                      This action cannot be undone.
                    </p>

                  </div>

                </div>


                {/* Current password */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm text-slate-300">
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) =>
                      setDeletePassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your current password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-500"
                  />

                </div>


                {/* DELETE confirmation */}

                <div className="mt-4">

                  <label className="mb-2 block text-sm text-slate-300">
                    Confirmation
                  </label>

                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) =>
                      setDeleteConfirmation(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder='Type "DELETE" to confirm'
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-500"
                  />

                </div>


                {/* Error */}

                {deleteError && (
                  <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {deleteError}
                  </div>
                )}


                {/* Actions */}

                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteSection(false);
                      setDeletePassword("");
                      setDeleteConfirmation("");
                      setDeleteError("");
                    }}
                    disabled={deleteLoading}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={
                      deleteLoading ||
                      !deletePassword ||
                      deleteConfirmation !== "DELETE"
                    }
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <Trash2 size={16} />

                    {deleteLoading
                      ? "Deleting Workspace..."
                      : "Permanently Delete"}

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}