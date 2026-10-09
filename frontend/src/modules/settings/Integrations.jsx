import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plug,
  MessageCircle,
  CreditCard,
  Mail,
  CalendarDays,
  Globe,
  CheckCircle,
} from "lucide-react";

const STORAGE_KEY = "business_os_integrations_state";

const defaultIntegrations = [
  {
    id: 1,
    name: "WhatsApp Business API",
    description: "Send automated booking confirmations and payment receipts.",
    type: "whatsapp",
    connected: true,
  },
  {
    id: 2,
    name: "Online Payment Gateway (Razorpay / Stripe)",
    description: "Accept instant UPI, Card, and Netbanking payments.",
    type: "payment",
    connected: true,
  },
  {
    id: 3,
    name: "Transactional Email Service (SMTP)",
    description: "Discharge automated payslips and customer tax invoices.",
    type: "email",
    connected: true,
  },
  {
    id: 4,
    name: "Google Calendar Sync",
    description: "Real-time appointment schedule synchronization with staff calendars.",
    type: "calendar",
    connected: false,
  },
  {
    id: 5,
    name: "Web Booking Portal",
    description: "Online appointment booking widget for your direct customers.",
    type: "website",
    connected: true,
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultIntegrations;
    } catch {
      return defaultIntegrations;
    }
  });

  const toggleConnection = (id) => {
    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Connected Integrations</h1>
        <p className="mt-1 text-slate-400">
          Third-party platform synchronization for omni-channel messaging, payments, and notifications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-base">{item.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.connected
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.connected ? "Active" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => toggleConnection(item.id)}
                className={`w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                  item.connected
                    ? "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {item.connected ? "Disconnect Service" : "Connect Integration"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
