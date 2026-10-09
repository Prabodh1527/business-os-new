import { useAuth } from "@/context/AuthContext";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading Business OS…
      </div>
    );
  }

  return <AppRoutes />;
}