import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Settings, UserCircle2 } from "lucide-react";

export default function ProfileDropdown({
  user,
  onLogout,
  profilePath = "/profile",
  settingsPath = "/settings",
  showSettings = true,
  employeeMode = false,
}) {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white">
          {user?.name?.[0] || "U"}
        </div>
        <div className="hidden xl:block text-left">
          <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
          <p className="text-[11px] text-slate-400">{user?.role || "Member"}</p>
        </div>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-xl">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
            <p className="text-xs text-slate-400">{user?.email || "No email"}</p>
            <p className="mt-2 inline-flex rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-400">
              {user?.role || "Member"}
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              to={profilePath}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <UserCircle2 size={16} />
              {employeeMode ? "My Profile" : "My Profile"}
            </Link>

            {showSettings ? (
              <Link
                to={settingsPath}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                <Settings size={16} />
                {employeeMode ? "Change Password" : "Settings"}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-slate-800"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
