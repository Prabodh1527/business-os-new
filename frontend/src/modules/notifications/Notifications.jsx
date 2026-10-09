import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Package,
  CalendarDays,
  Users,
  Sparkles,
  TrendingUp,
  Check,
  Trash2,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  clearAllNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications.api';

const typeIcons = {
  Inventory: Package,
  Appointment: CalendarDays,
  Employee: Users,
  AI: Sparkles,
  Revenue: TrendingUp,
  General: Bell,
};

const categories = ['All', 'Inventory', 'Appointment', 'Employee', 'AI', 'Revenue'];

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setError('');
      const res = await fetchNotifications(token);
      setNotifications(res.notifications || res.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id || item.id === id ? { ...item, read: true } : item))
      );
    } catch (err) {
      setError(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(err.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id, token);
      setNotifications((prev) => prev.filter((item) => item._id !== id && item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await clearAllNotifications(token);
      setNotifications([]);
    } catch (err) {
      setError(err.message || 'Failed to clear notifications');
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'All') return notifications;
    return notifications.filter((item) => item.type?.toLowerCase() === activeFilter.toLowerCase());
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-slate-400">
            Stay updated with important business activities. {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
            >
              <Trash2 size={15} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter size={18} />
          Filter
        </div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              activeFilter === category
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No notifications found.
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const notifId = notification._id || notification.id;
            return (
              <div
                key={notifId}
                className={`rounded-2xl border p-5 transition ${
                  notification.read
                    ? 'border-slate-800 bg-slate-900'
                    : 'border-indigo-500/40 bg-indigo-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="rounded-xl bg-slate-800 p-3 text-indigo-400">
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-white">{notification.title}</h2>
                        {!notification.read && (
                          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{notification.message}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        {notification.type || 'General'} • {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notifId)}
                        className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-400"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notifId)}
                      className="rounded-lg border border-slate-700 p-2 text-red-400 hover:border-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
