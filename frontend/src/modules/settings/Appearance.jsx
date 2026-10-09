import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Palette,
  Save,
  Image,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import API from "@/api/axios";
import { useTheme } from "@/context/ThemeContext";

export default function Appearance() {
  const {
    theme,
    brandColor,
    compact,
    showAnimations,
    updateTheme,
    updateBrandColor,
    updateCompact,
    updateShowAnimations,
  } = useTheme();

  const [settings, setSettings] = useState({
    theme,
    brandColor,
    compact,
    showAnimations,
  });

  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings({ theme, brandColor, compact, showAnimations });
  }, [theme, brandColor, compact, showAnimations]);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoadingBusiness(true);
        const response = await API.get("/tenant/me");
        if (response.data?.success) {
          const b = response.data.data;
          setBusiness(b);
        }
      } catch (error) {
        console.error("Failed to load business branding:", error);
      } finally {
        setLoadingBusiness(false);
      }
    };

    loadBusiness();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (name === "theme") updateTheme(value);
    if (name === "brandColor") updateBrandColor(value);
  };

  const toggle = (key) => {
    const nextVal = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: nextVal }));
    if (key === "compact") updateCompact(nextVal);
    if (key === "showAnimations") updateShowAnimations(nextVal);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await API.put("/tenant/me", {
        theme: settings.theme,
        brandColor: settings.brandColor,
        compactLayout: settings.compact,
        showAnimations: settings.showAnimations,
      });
      localStorage.setItem("app-theme", settings.theme);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save appearance settings");
    } finally {
      setSaving(false);
    }
  };

  const businessName = business?.companyName || "Business OS";

  const logoLetter = businessName
    .trim()
    .charAt(0)
    .toUpperCase();

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
          Appearance
        </h1>

        <p className="mt-1 text-slate-400">
          Customize the look and feel of your Business OS workspace.
        </p>
      </div>

      {/* Branding */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
            <Image size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Branding
            </h2>

            <p className="text-sm text-slate-400">
              Customize your business identity.
            </p>
          </div>

        </div>

        <div className="flex items-center gap-5">

          {business?.logo ? (
            <img
              src={business.logo}
              alt={`${businessName} logo`}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
              {loadingBusiness ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                logoLetter
              )}
            </div>
          )}

          <div>

            <h3 className="font-medium text-white">
              {loadingBusiness ? "Loading..." : businessName}
            </h3>

            <p className="text-sm text-slate-400">
              Business Logo
            </p>

            <button
              type="button"
              className="mt-3 rounded-xl border border-slate-700 px-4 py-2 text-sm text-white transition hover:border-indigo-500"
            >
              Change Logo
            </button>

          </div>

        </div>

      </div>

      {/* Theme Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
            <Palette size={22} />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Theme Preferences
          </h2>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="text-sm text-slate-400">
              Theme
            </label>

            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
            >
              <option>Dark</option>
              <option>Light</option>
              <option>System</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">
              Brand Color
            </label>

            <select
              name="brandColor"
              value={settings.brandColor}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
            >
              <option>Indigo</option>
              <option>Blue</option>
              <option>Purple</option>
              <option>Emerald</option>
            </select>
          </div>

        </div>

      </div>

      {/* Dashboard Preferences */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
            <LayoutDashboard size={22} />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Dashboard Preferences
          </h2>

        </div>

        <div className="space-y-4">

          <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

            <div>
              <p className="font-medium text-white">
                Compact Layout
              </p>

              <p className="text-sm text-slate-400">
                Reduce spacing in dashboard cards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggle("compact")}
              className={`rounded-full px-4 py-2 text-sm ${
                settings.compact
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {settings.compact ? "ON" : "OFF"}
            </button>

          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

            <div>
              <p className="font-medium text-white">
                Animations
              </p>

              <p className="text-sm text-slate-400">
                Enable smooth UI transitions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggle("showAnimations")}
              className={`rounded-full px-4 py-2 text-sm ${
                settings.showAnimations
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {settings.showAnimations ? "ON" : "OFF"}
            </button>

          </div>

        </div>

      </div>

      {/* Save */}
      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Appearance"}
        </button>

        {saved && (
          <p className="text-sm text-emerald-400">
            Appearance updated successfully
          </p>
        )}

      </div>

    </div>
  );
}