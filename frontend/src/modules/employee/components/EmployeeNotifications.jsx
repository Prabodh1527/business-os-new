import { useCallback, useEffect, useState } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/notifications.api";

export default function EmployeeNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const response = await fetchNotifications(token);
      setNotifications(response.notifications || response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id, token);
      await loadNotifications();
    } catch (readError) {
      setError(readError.message || "Unable to update notification.");
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead(token);
      await loadNotifications();
    } catch (readError) {
      setError(readError.message || "Unable to update notifications.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Employee Notifications</h1><p className="mt-1 text-sm text-slate-400">Updates shared by your business owner.</p></div>
        {notifications.some((item) => !item.read) && <button onClick={markAllRead} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"><CheckCheck size={15} />Mark all read</button>}
      </div>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}
      {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading notifications…</p> : notifications.length === 0 ? <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-500">You have no notifications.</p> : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <button key={item._id} onClick={() => !item.read && markRead(item._id)} className={`block w-full rounded-2xl border p-4 text-left transition ${item.read ? "border-slate-800 bg-slate-900" : "border-indigo-500/30 bg-indigo-950/20 hover:border-indigo-400/50"}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400"><BellRing size={18} /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-white">{item.title}</h3><span className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span></div>
                  <p className="mt-2 text-sm text-slate-400">{item.message}</p>
                  {!item.read && <span className="mt-2 inline-block text-[11px] font-semibold text-indigo-400">Unread · click to mark read</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
