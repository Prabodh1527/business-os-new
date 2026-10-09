import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Save, Check, RefreshCw } from "lucide-react";

const STORAGE_KEY = "business_os_roles_permissions";

const defaultRoles = [
  {
    name: "Owner",
    description: "Complete business control & administrative oversight",
    permissions: {
      customers: true,
      appointments: true,
      billing: true,
      inventory: true,
      employees: true,
      attendance: true,
      reports: true,
      ai: true,
    },
  },
  {
    name: "Manager",
    description: "Manage daily team operations and schedules",
    permissions: {
      customers: true,
      appointments: true,
      billing: true,
      inventory: true,
      employees: true,
      attendance: true,
      reports: true,
      ai: false,
    },
  },
  {
    name: "Employee",
    description: "Staff portal self-service access",
    permissions: {
      customers: false,
      appointments: true,
      billing: false,
      inventory: false,
      employees: false,
      attendance: true,
      reports: false,
      ai: false,
    },
  },
];

export default function Roles() {
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultRoles;
    } catch {
      return defaultRoles;
    }
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const togglePermission = (roleIndex, permKey) => {
    setRoles((prev) => {
      const next = [...prev];
      next[roleIndex] = {
        ...next[roleIndex],
        permissions: {
          ...next[roleIndex].permissions,
          [permKey]: !next[roleIndex].permissions[permKey],
        },
      };
      return next;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } catch (e) {
      alert("Failed to save roles");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Roles & Permissions</h1>
          <p className="mt-1 text-slate-400">
            Define system authorization boundaries for owners, managers, and staff members.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      {savedMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-center gap-2">
          <Check size={16} /> Permissions updated successfully!
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((role, rIdx) => (
          <div
            key={role.name}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{role.name}</h2>
                <p className="text-xs text-slate-400">{role.description}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2.5">
              {Object.entries(role.permissions).map(([perm, granted]) => (
                <label
                  key={perm}
                  className="flex items-center justify-between cursor-pointer rounded-lg p-1.5 hover:bg-slate-800/40"
                >
                  <span className="text-xs font-medium capitalize text-slate-300">
                    {perm} Module
                  </span>
                  <input
                    type="checkbox"
                    checked={granted}
                    onChange={() => togglePermission(rIdx, perm)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
