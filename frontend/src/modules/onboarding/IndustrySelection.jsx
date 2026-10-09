import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import API from "@/api/axios";

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

export default function IndustrySelection() {
  const navigate = useNavigate();

  const [industry, setIndustry] = useState("");
  const [otherIndustry, setOtherIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const next = async () => {
    const selectedIndustry =
      industry === "Other"
        ? otherIndustry.trim()
        : industry;

    if (!selectedIndustry) return;

    try {
      setSaving(true);
      setError("");

      const current = await API.get("/tenant/me");
      const tenant = current.data?.data;

      await API.put("/tenant/me", {
        ...tenant,
        companyName: tenant.companyName,
        businessType: selectedIndustry,
      });

      navigate("/onboarding/complete");
    } catch (err) {
      console.error("Industry save error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save your business type."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-3xl font-bold text-white">
          Choose Your Industry
        </h1>

        <p className="mt-2 text-slate-400">
          Select the type of business you operate.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-4 mt-8 sm:grid-cols-2 md:grid-cols-3">
          {industries.map((item) => (
            <button
              key={item}
              type="button"
              disabled={saving}
              onClick={() => setIndustry(item)}
              className={`rounded-xl p-4 text-sm text-white border transition ${
                industry === item
                  ? "border-indigo-500 bg-indigo-500/20"
                  : "border-slate-700 bg-slate-800 hover:border-indigo-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {industry === "Other" && (
          <div className="mt-6">
            <label className="text-sm text-slate-400">
              Your industry
            </label>

            <input
              value={otherIndustry}
              onChange={(e) => setOtherIndustry(e.target.value)}
              placeholder="Example: Photography, Pet Care, Architecture"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <button
          disabled={
            saving ||
            !industry ||
            (industry === "Other" && !otherIndustry.trim())
          }
          onClick={next}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
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
      </div>
    </div>
  );
}