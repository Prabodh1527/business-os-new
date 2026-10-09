import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
          <Compass size={24} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">The page you’re looking for doesn’t exist or may have moved.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Return home</Link>
      </div>
    </div>
  );
}
