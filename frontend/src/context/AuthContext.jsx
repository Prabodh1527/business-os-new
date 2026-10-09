import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  clearAuthStorage,
  completeOnboardingForUser,
  getStoredUser,
} from "@/services/authService";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "http://localhost:5000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to parse JWT and verify expiration
  const isTokenExpired = useCallback((jwtToken) => {
    if (!jwtToken || typeof jwtToken !== "string") return true;
    try {
      const parts = jwtToken.split(".");
      if (parts.length !== 3) return true;

      // Safe base64url decoding
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      if (!payload.exp) return false;

      // 5-second buffer to prevent edge-case timing errors
      return Date.now() >= payload.exp * 1000 - 5000;
    } catch (err) {
      return true; // Treat malformed tokens as expired
    }
  }, []);

  const persistAuth = useCallback((userData, rawToken) => {
    if (userData && rawToken) {
      setUser(userData);
      setToken(rawToken);

      localStorage.setItem("token", rawToken);

      const fullAuthPayload = {
        ...(typeof userData === "object" ? userData : {}),
        token: rawToken,
      };
      localStorage.setItem("business-os-auth", JSON.stringify(fullAuthPayload));
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      setUser(null);
      setToken(null);
      clearAuthStorage();
      localStorage.removeItem("business-os-auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    try {
      let storedToken = localStorage.getItem("token");
      let storedUser = getStoredUser();

      // Attempt parsing fallback user if getStoredUser returned null
      if (!storedUser) {
        const rawAuth = localStorage.getItem("business-os-auth");
        if (rawAuth) {
          try {
            const parsed = JSON.parse(rawAuth);
            storedUser = parsed;
            if (!storedToken && parsed.token) {
              storedToken = parsed.token;
            }
          } catch (e) {
            // Invalid local storage JSON fallback ignored
          }
        }
      }

      // Verify token validity on initialization
      if (storedToken && !isTokenExpired(storedToken)) {
        setToken(storedToken);
        if (storedUser) setUser(storedUser);
      } else {
        persistAuth(null, null);
      }
    } catch (err) {
      console.error("Auth state initialization error:", err);
      persistAuth(null, null);
    } finally {
      setLoading(false);
    }
  }, [isTokenExpired, persistAuth]);

  // Sync session state across multiple tabs or external clear calls
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "business-os-auth") {
        if (!e.newValue) {
          setUser(null);
          setToken(null);
        } else if (e.key === "token" && e.newValue !== token) {
          if (!isTokenExpired(e.newValue)) {
            setToken(e.newValue);
          } else {
            persistAuth(null, null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [token, isTokenExpired, persistAuth]);

  const signIn = async ({ email, password, role = "OWNER" }) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Invalid credentials",
        };
      }

      const jwtToken = data.token || data.user?.token;
      const userObj = data.user || data;

      if (!jwtToken) {
        return {
          success: false,
          message: "No token returned from backend login response",
        };
      }

      persistAuth(userObj, jwtToken);

      return {
        success: true,
        user: userObj,
        token: jwtToken,
        message: data.message,
      };
    } catch (error) {
      console.error("SignIn server connection error:", error);
      return {
        success: false,
        message: "Server connection failed. Please ensure your backend is running.",
      };
    }
  };

  const signUp = async ({ name, email, password, role = "OWNER" }) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }

      const jwtToken = data.token || data.user?.token;
      const userObj = data.user || data;

      if (!jwtToken) {
        return {
          success: false,
          message: "No token returned from backend registration response",
        };
      }

      persistAuth(userObj, jwtToken);

      return {
        success: true,
        user: userObj,
        token: jwtToken,
        message: data.message,
      };
    } catch (error) {
      console.error("SignUp server connection error:", error);
      return {
        success: false,
        message: "Server connection failed. Please ensure your backend is running.",
      };
    }
  };

  const signOut = useCallback(() => {
    persistAuth(null, null);
  }, [persistAuth]);

  const completeOnboarding = () => {
    if (!user) return;
    const nextUser = completeOnboardingForUser(user);
    if (nextUser) {
      persistAuth(nextUser, token);
    }
  };

  const getAuthHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signUp,
      signOut,
      logout: signOut,
      completeOnboarding,
      getAuthHeaders,
      isAuthenticated: Boolean(token && !isTokenExpired(token)),
    }),
    [user, token, loading, signOut, completeOnboarding, getAuthHeaders, isTokenExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}