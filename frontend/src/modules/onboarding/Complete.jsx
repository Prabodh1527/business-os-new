import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import API from "@/api/axios";

export default function Complete() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeSetup = async () => {
      try {
        const response = await API.get("/tenant/me");
        const tenant = response.data?.data;

        if (tenant?.companyName) {
          await API.put("/tenant/me", {
            ...tenant,
            companyName: tenant.companyName,
            onboardingCompleted: true,
          });
        }

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      } catch (error) {
        console.error("Onboarding completion error:", error);

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      }
    };

    completeSetup();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={42} />
        </div>

        <h1 className="mt-7 text-3xl font-bold text-white">
          You're all set!
        </h1>

        <p className="mt-3 text-slate-400">
          Your Business OS workspace has been configured successfully.
        </p>

        <div className="mt-6 text-sm text-slate-500">
          Taking you to your dashboard...
        </div>

      </div>
    </div>
  );
}