export default function AuthLayout({
  children,
  title,
  subtitle,
  mode = "OWNER",
  badgeText,
  heroTag,
  heroTitle,
  heroSubtitle,
  features,
}) {
  const isEmployee = mode?.toUpperCase() === "EMPLOYEE";

  const defaultBadge = isEmployee ? "Employee Portal" : "Business OS";
  const defaultHeroTag = isEmployee ? "Staff Workspace" : "Unified operations";
  const defaultHeroTitle = isEmployee
    ? "Your dedicated workspace for everyday staff operations."
    : "One AI-powered operating system for modern teams.";
  const defaultHeroSubtitle = isEmployee
    ? "Check your daily shifts, clock in & out with precision, manage leave requests, and review your digital payslips in one place."
    : "Coordinate customers, appointments, billing, inventory, staff, and smart insights from a single elegant workspace.";

  const defaultFeatures = isEmployee
    ? [
        "🗓️ Shift Schedule",
        "⏱️ One-Tap Attendance",
        "🏖️ Leave Balance & Requests",
        "💵 Digital Payslips",
        "✅ Assigned Task Tracker",
        "📢 Company Announcements",
      ]
    : [
        "Customer CRM",
        "Automated billing",
        "Live inventory",
        "AI analyst",
      ];

  const currentBadge = badgeText || defaultBadge;
  const currentHeroTag = heroTag || defaultHeroTag;
  const currentHeroTitle = heroTitle || defaultHeroTitle;
  const currentHeroSubtitle = heroSubtitle || defaultHeroSubtitle;
  const currentFeatures = features || defaultFeatures;

  const bgGradient = isEmployee
    ? "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_45%),linear-gradient(140deg,_#020617,_#041a16,_#020617)]"
    : "bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_45%),linear-gradient(140deg,_#020617,_#0f172a)]";

  const cardBorder = isEmployee
    ? "border-emerald-500/25 bg-slate-900/80 shadow-emerald-950/30"
    : "border-slate-800/80 bg-slate-900/70 shadow-slate-950/40";

  const heroBorder = isEmployee
    ? "border-emerald-500/25 bg-slate-900/60"
    : "border-indigo-500/20 bg-slate-900/50";

  const badgeColor = isEmployee ? "text-emerald-400" : "text-indigo-300";

  return (
    <div className={`min-h-screen ${bgGradient} px-4 py-10 text-white transition-colors duration-500`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row">
        <div className={`max-w-xl rounded-3xl border ${cardBorder} p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:w-[440px]`}>
          <div className="mb-6">
            <span className={`inline-block text-xs font-semibold uppercase tracking-[0.25em] ${badgeColor} rounded-full border ${isEmployee ? "border-emerald-500/30 bg-emerald-500/10" : "border-indigo-500/30 bg-indigo-500/10"} px-3 py-1 mb-2`}>
              {currentBadge}
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-white tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className={`hidden max-w-xl flex-1 rounded-3xl border ${heroBorder} p-8 lg:block transition-all duration-300`}>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-400">
            {currentHeroTag}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white leading-snug">
            {currentHeroTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {currentHeroSubtitle}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {currentFeatures.map((item) => (
              <div
                key={item}
                className={`rounded-2xl border ${isEmployee ? "border-emerald-900/40 bg-emerald-950/20 text-emerald-200" : "border-slate-800 bg-slate-950/70 text-slate-300"} px-4 py-3 text-sm font-medium transition`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
