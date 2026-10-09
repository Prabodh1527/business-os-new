import { Link } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";

export default function ResetPassword() {
  return (
    <AuthLayout title="Set a new password" subtitle="Choose a fresh password for your account.">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="mb-4 flex items-center gap-3 text-slate-300">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
            <LockKeyhole size={18} />
          </div>
          <div>
            <p className="font-medium text-white">Secure reset</p>
            <p className="text-sm text-slate-400">Use the same demo credentials if you’re testing the prototype.</p>
          </div>
        </div>
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="New password" type="password" />
          <input className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Confirm password" type="password" />
        </div>
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
        Save password
        <ArrowRight size={16} />
      </button>
      <p className="mt-5 text-sm text-slate-400">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
