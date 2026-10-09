import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  BarChart3,
} from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl md:p-14">

          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
            <Sparkles size={38} />
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-5xl">
            Welcome to Business OS
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            Let's set up your workspace in a few simple steps.
            Business OS will use your business information to
            personalize your experience.
          </p>

          {/* Feature cards */}
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Building2 size={21} />
              </div>

              <h3 className="mt-4 font-semibold">
                Business Profile
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tell us about your business.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Users size={21} />
              </div>

              <h3 className="mt-4 font-semibold">
                Personalization
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Configure your business type.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <BarChart3 size={21} />
              </div>

              <h3 className="mt-4 font-semibold">
                Ready to Grow
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your workspace will be ready.
              </p>
            </div>

          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/onboarding/business")}
            className="mx-auto mt-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white transition hover:bg-indigo-500"
          >
            Start Setup
            <ArrowRight size={18} />
          </button>

          <p className="mt-4 text-xs text-slate-600">
            Takes only a few minutes
          </p>

        </div>
      </div>
    </div>
  );
}