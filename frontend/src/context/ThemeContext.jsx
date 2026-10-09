import React, { createContext, useContext, useEffect, useState } from "react";
import API from "@/api/axios";

const ThemeContext = createContext();

export const BRAND_COLORS = {
  Indigo: {
    name: "Indigo",
    primary: "oklch(0.55 0.22 270)",
    accent: "#6366f1",
    cssHue: "270",
  },
  Blue: {
    name: "Blue",
    primary: "oklch(0.58 0.20 250)",
    accent: "#3b82f6",
    cssHue: "250",
  },
  Purple: {
    name: "Purple",
    primary: "oklch(0.56 0.24 300)",
    accent: "#a855f7",
    cssHue: "300",
  },
  Emerald: {
    name: "Emerald",
    primary: "oklch(0.60 0.18 150)",
    accent: "#10b981",
    cssHue: "150",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "Dark";
  });
  const [brandColor, setBrandColor] = useState(() => {
    return localStorage.getItem("app-brand-color") || "Indigo";
  });
  const [compact, setCompact] = useState(() => {
    return localStorage.getItem("app-compact") === "true";
  });
  const [showAnimations, setShowAnimations] = useState(() => {
    return localStorage.getItem("app-animations") !== "false";
  });

  // Apply theme attributes to <html> & <body>
  useEffect(() => {
    const root = document.documentElement;

    let effectiveTheme = theme;
    if (theme === "System") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = systemDark ? "Dark" : "Light";
    }

    if (effectiveTheme === "Light") {
      root.classList.add("theme-light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.remove("theme-light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    }

    root.setAttribute("data-brand", brandColor.toLowerCase());

    if (compact) {
      root.classList.add("layout-compact");
    } else {
      root.classList.remove("layout-compact");
    }

    if (!showAnimations) {
      root.classList.add("no-animations");
    } else {
      root.classList.remove("no-animations");
    }

    localStorage.setItem("app-theme", theme);
    localStorage.setItem("app-brand-color", brandColor);
    localStorage.setItem("app-compact", String(compact));
    localStorage.setItem("app-animations", String(showAnimations));
  }, [theme, brandColor, compact, showAnimations]);

  // Load saved tenant settings on boot
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    API.get("/tenant/me")
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const tenant = res.data.data;
          if (tenant.theme) setTheme(tenant.theme);
          if (tenant.brandColor) setBrandColor(tenant.brandColor);
          if (tenant.compactLayout !== undefined) setCompact(Boolean(tenant.compactLayout));
          if (tenant.showAnimations !== undefined) setShowAnimations(Boolean(tenant.showAnimations));
        }
      })
      .catch(() => {});
  }, []);

  const updateTheme = (newTheme) => setTheme(newTheme);
  const updateBrandColor = (newColor) => setBrandColor(newColor);
  const updateCompact = (val) => setCompact(val);
  const updateShowAnimations = (val) => setShowAnimations(val);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        brandColor,
        compact,
        showAnimations,
        updateTheme,
        updateBrandColor,
        updateCompact,
        updateShowAnimations,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
