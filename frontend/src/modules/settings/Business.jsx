import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const industries = [
  "Salon & Beauty",
  "Clinic & Healthcare",
  "Dental Clinic",
  "Hospital",
  "Restaurant",
  "Cafe & Bakery",
  "Hotel & Hospitality",
  "Retail Store",
  "Supermarket",
  "Fashion & Apparel",
  "Jewellery Store",
  "Electronics Store",
  "Real Estate",
  "Construction",
  "Interior Design",
  "Architecture Firm",
  "Education & Training",
  "Coaching Institute",
  "Consulting",
  "Finance & Accounting",
  "Legal Services",
  "Marketing Agency",
  "IT Services",
  "Software Company",
  "Manufacturing",
  "Wholesale Distribution",
  "Automobile Services",
  "Gym & Fitness Center",
  "Travel & Tourism",
  "Event Management",
  "Logistics & Transportation",
  "Agriculture",
  "Pharmacy",
  "Veterinary Services",
  "Repair & Maintenance",
  "Freelance Services",
  "Other",
];
import {
  Building2,
  Save,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";

import API from "@/api/axios";

const emptyBusiness = {
  companyName: "",
  businessType: "",
  businessEmail: "",
  businessPhone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  website: "",
  openTime: "",
  closeTime: "",
};

export default function Business() {
  const [business, setBusiness] = useState(emptyBusiness);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/tenant/me");

      if (response.data?.success) {
        const tenant = response.data.data || {};

        setBusiness({
          companyName: tenant.companyName || "",
          businessType: tenant.businessType || "",
          businessEmail: tenant.businessEmail || "",
          businessPhone: tenant.businessPhone || "",
          address: tenant.address || "",
          city: tenant.city || "",
          state: tenant.state || "",
          country: tenant.country || "India",
          postalCode: tenant.postalCode || "",
          website: tenant.website || "",
          openTime: tenant.openTime || "",
          closeTime: tenant.closeTime || "",
        });
      }
    } catch (err) {
      console.error("Failed to load business:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load business information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBusiness((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const saveBusiness = async (e) => {
    e.preventDefault();

    if (!business.companyName.trim()) {
      setError("Business name is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await API.put("/tenant/me", business);

      if (response.data?.success) {
        const tenant = response.data.data || {};

        setBusiness({
          companyName: tenant.companyName || "",
          businessType: tenant.businessType || "",
          businessEmail: tenant.businessEmail || "",
          businessPhone: tenant.businessPhone || "",
          address: tenant.address || "",
          city: tenant.city || "",
          state: tenant.state || "",
          country: tenant.country || "India",
          postalCode: tenant.postalCode || "",
          website: tenant.website || "",
          openTime: tenant.openTime || "",
          closeTime: tenant.closeTime || "",
        });

        setMessage("Changes saved successfully.");
      }
    } catch (err) {
      console.error("Failed to save business:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save business information."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-400">
        <Loader2 size={22} className="mr-2 animate-spin" />
        Loading business information...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <Link
          to="/settings"
          className="mb-3 block text-sm text-slate-400 hover:text-white"
        >
          ← Back to Settings
        </Link>

        <h1 className="text-3xl font-bold text-white">
          Business Settings
        </h1>

        <p className="mt-1 text-slate-400">
          Manage your business profile and operating details.
        </p>
      </div>

      <form
        onSubmit={saveBusiness}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* Business Profile */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
            <Building2 size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Business Profile
            </h2>

            <p className="text-sm text-slate-400">
              Basic information about your business.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* Business Name */}
          <div>
            <label className="text-sm text-slate-400">
              Business Name *
            </label>

            <input
              name="companyName"
              value={business.companyName}
              onChange={handleChange}
              required
              placeholder="Your business name"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="text-sm text-slate-400">
              Business Type
            </label>

            <select
              name="businessType"
              value={business.businessType}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            >
              <option value="">Select your business type</option>

              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <Mail size={15} />
              Business Email
            </label>

            <input
              type="email"
              name="businessEmail"
              value={business.businessEmail}
              onChange={handleChange}
              placeholder="business@example.com"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <Phone size={15} />
              Business Phone
            </label>

            <input
              name="businessPhone"
              value={business.businessPhone}
              onChange={handleChange}
              placeholder="+91..."
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin size={15} />
              Address
            </label>

            <textarea
              name="address"
              value={business.address}
              onChange={handleChange}
              rows="3"
              placeholder="Business address"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="text-sm text-slate-400">
              City
            </label>

            <input
              name="city"
              value={business.city}
              onChange={handleChange}
              placeholder="City"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* State */}
          <div>
            <label className="text-sm text-slate-400">
              State
            </label>

            <input
              name="state"
              value={business.state}
              onChange={handleChange}
              placeholder="State"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm text-slate-400">
              Country
            </label>

            <input
              name="country"
              value={business.country}
              onChange={handleChange}
              placeholder="Country"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="text-sm text-slate-400">
              Postal Code
            </label>

            <input
              name="postalCode"
              value={business.postalCode}
              onChange={handleChange}
              placeholder="Postal / ZIP code"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label className="text-sm text-slate-400">
              Website
            </label>

            <input
              name="website"
              value={business.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Working Hours */}
        <div className="border-t border-slate-800 pt-6">

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Clock size={20} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Working Hours
              </h2>

              <p className="text-sm text-slate-400">
                Define your normal operating hours.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="text-sm text-slate-400">
                Opening Time
              </label>

              <input
                type="time"
                name="openTime"
                value={business.openTime}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Closing Time
              </label>

              <input
                type="time"
                name="closeTime"
                value={business.closeTime}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">

          <p className="text-xs text-slate-500">
            These details are used throughout your Business OS workspace.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}