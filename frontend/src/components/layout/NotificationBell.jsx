import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchNotifications } from "@/api/notifications.api";

export default function NotificationBell() {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!token) return;
        const res = await fetchNotifications(token);
        if (mounted && res.success) {
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (e) {
        // silent fail
      }
    };
    load();
    return () => (mounted = false);
  }, [token]);

  return (
    <Link
      to="/notifications"
      className="relative rounded-xl border border-slate-800 bg-slate-900 p-2.5 transition hover:border-indigo-500 hover:bg-slate-800"
      title="Notifications"
    >
      <Bell size={17} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
