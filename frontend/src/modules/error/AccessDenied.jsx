import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <ShieldAlert size={24} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">You do not have permission to view this section. Please switch to an authorized role or return to the dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Go to dashboard</Link>
          <Link to="/login" className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white">Log out</Link>
        </div>
      </div>
    </div>
  );
}
