import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "business-os-onboarding";

const defaultData = {
  business: {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
  },
  industry: "",
  services: [],
  employees: [],
  invites: [],
};

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      return defaultData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateBusiness = (values) => {
    setData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        ...values,
      },
    }));
  };

  const setIndustry = (industry) => {
    setData((prev) => ({
      ...prev,
      industry,
    }));
  };

  const setServices = (services) => {
    setData((prev) => ({
      ...prev,
      services,
    }));
  };

  const setEmployees = (employees) => {
    setData((prev) => ({
      ...prev,
      employees,
    }));
  };

  const setInvites = (invites) => {
    setData((prev) => ({
      ...prev,
      invites,
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
  };

  const value = useMemo(
    () => ({
      data,
      updateBusiness,
      setIndustry,
      setServices,
      setEmployees,
      setInvites,
      resetOnboarding,
    }),
    [data]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  }

  return context;
}