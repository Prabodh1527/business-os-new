import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import API from "@/api/axios";

export default function DashboardLayout() {
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadBusiness = async () => {
      try {
        const response = await API.get("/tenant/me");

        if (mounted && response.data?.success) {
          setBusiness(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load business profile:", error);
      }
    };

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar business={business} />
      </div>

      {/* Main */}
      <div className="ml-64 flex flex-1 flex-col">
        <Topbar business={business} />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}