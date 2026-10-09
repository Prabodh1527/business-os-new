
export const AUTH_STORAGE_KEY = "business-os-auth";
export const ONBOARDING_STORAGE_KEY = "business-os-onboarding";

const API_URL = "http://localhost:5000/api/auth";

export const demoAccounts = {
  OWNER: {
    id: "owner-1",
    name: "Prabodh Singh",
    email: "owner@businessos.com",
    password: "password123",
    role: "OWNER",
    company: "Northstar Studio",
  },
  MANAGER: {
    id: "manager-1",
    name: "Asha Mehta",
    email: "manager@businessos.com",
    password: "password123",
    role: "MANAGER",
    company: "Northstar Studio",
  },
  RECEPTIONIST: {
    id: "receptionist-1",
    name: "Ravi Kumar",
    email: "receptionist@businessos.com",
    password: "password123",
    role: "RECEPTIONIST",
    company: "Northstar Studio",
  },
  EMPLOYEE: {
    id: "employee-1",
    name: "Neha Rao",
    email: "employee@businessos.com",
    password: "password123",
    role: "EMPLOYEE",
    company: "Northstar Studio",
  },
};

export function getStoredUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to restore auth state", error);
    return null;
  }
}

export function persistUser(nextUser) {
  if (nextUser) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  sessionStorage.clear();
}

export async function signInWithCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Try backend first
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const nextUser = {
        ...data,
        onboardingCompleted: Boolean(localStorage.getItem(ONBOARDING_STORAGE_KEY)),
      };
      persistUser(nextUser);
      return { success: true, user: nextUser, message: "Signed in successfully." };
    }
  } catch (error) {
    console.warn("Backend unavailable, checking demo accounts...", error);
  }

  // Fallback to Demo Accounts
  const account = Object.values(demoAccounts).find(
    (entry) => entry.email === normalizedEmail && entry.password === password
  );

  if (!account) {
    return { success: false, message: "Invalid email or password." };
  }

  const nextUser = {
    ...account,
    onboardingCompleted: Boolean(localStorage.getItem(ONBOARDING_STORAGE_KEY)),
  };

  persistUser(nextUser);
  return { success: true, user: nextUser, message: "Signed in successfully." };
}

export async function signUpWithRole(name, email, password, role = "OWNER") {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Registration failed." };
    }

    const nextUser = {
      ...data,
      onboardingCompleted: false,
    };

    persistUser(nextUser);
    return { success: true, user: nextUser, message: "Account created successfully." };
  } catch (error) {
    console.error("Failed to reach server:", error);
    return { success: false, message: "Cannot connect to server. Ensure backend is running." };
  }
}

export function completeOnboardingForUser(user) {
  if (!user) return null;
  const nextUser = { ...user, onboardingCompleted: true };
  localStorage.setItem(ONBOARDING_STORAGE_KEY, "completed");
  persistUser(nextUser);
  return nextUser;
}

export function getRoleHomePath(role) {
  if (role === "EMPLOYEE") return "/employee/dashboard";
  if (role === "MANAGER") return "/dashboard";
  if (role === "RECEPTIONIST") return "/dashboard";
  return "/dashboard";
}