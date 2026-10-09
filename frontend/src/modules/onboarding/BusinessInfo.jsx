import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Loader2,
} from "lucide-react";
import API from "@/api/axios";

export default function BusinessInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    companyName: "",
    businessType: "",
    description: "",
    businessEmail: user?.email || "",
    businessPhone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    website: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.companyName.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!form.businessType.trim()) {
      setError("Please select your business type.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await API.put("/tenant/me", form);

      navigate("/onboarding/industry");
    } catch (err) {
      console.error("Business onboarding error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save business information."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Building2 size={28} />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Tell us about your business
          </h1>

          <p className="mt-2 text-slate-400">
            We'll use this information to personalize your Business OS workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8"
        >
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">
                Business Name *
              </label>

              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                placeholder="Your business name"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Business Type *
              </label>

              <input
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                required
                placeholder="e.g. Clinic, Retail, Consulting"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">
                Business Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us briefly about your business..."
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <Mail size={15} />
                Business Email
              </label>

              <input
                type="email"
                name="businessEmail"
                value={form.businessEmail}
                onChange={handleChange}
                placeholder="business@example.com"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <Phone size={15} />
                Business Phone
              </label>

              <input
                name="businessPhone"
                value={form.businessPhone}
                onChange={handleChange}
                placeholder="+91..."
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={15} />
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                placeholder="Business address"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                City
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                State
              </label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Country
              </label>

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Postal Code
              </label>

              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal / ZIP code"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <Globe size={15} />
                Website
                <span className="text-slate-500">
                  Optional
                </span>
              </label>

              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}