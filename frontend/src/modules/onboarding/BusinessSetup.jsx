import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";

export default function BusinessSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "Northstar Studio", industry: "Salon", location: "Mumbai", phone: "+91 9876543210", email: "hello@northstarstudio.com" });

  return (
    <AuthLayout title="Business information" subtitle="Tell us a little about your business so we can tailor the workspace.">
      <form onSubmit={(event) => { event.preventDefault(); navigate("/onboarding/industry"); }} className="space-y-4">
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Business name" />
        <select value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500">
          <option>Salon</option>
          <option>Clinic</option>
          <option>Restaurant</option>
          <option>Construction</option>
        </select>
        <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Location" />
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Contact number" />
        <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Business email" />
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
          Continue
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthLayout>
  );
}
