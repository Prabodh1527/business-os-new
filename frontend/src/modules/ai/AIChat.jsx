import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, Bot, User, Sparkles, Loader2, ArrowRight, Database } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendAIChat } from "@/api/ai.api";

const initialMessages = [
  {
    type: "ai",
    text: "### 👋 Hello! I am your AI Business Analyst\n\nI have continuous, read-only access to your business operations: **Revenue & Invoices**, **Inventory & SKUs**, **Operating Expenses & Payroll**, **Customers & Retention**, and **Appointments & Staff Attendance**.\n\nAsk me anything in natural language—for example, *Why did revenue change?*, *What are our biggest expenses?*, *Which items are underperforming?*, or *What should I prioritize this week?*",
  },
];

export default function AIChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e, textOverride) => {
    e?.preventDefault();
    const query = (textOverride || input).trim();
    if (!query || loading) return;

    const userMsg = { type: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await sendAIChat(query, token, historyPayload);
      const aiReply = res.reply || res.message || "I analyzed your request against your latest metrics.";
      setMessages((prev) => [...prev, { type: "ai", text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "⚠️ Unable to query business analyst service right now. Please ensure your backend connection is active and retry.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Why did revenue change this month?",
    "Which products are underperforming or low in stock?",
    "What are our biggest expenses?",
    "How has employee attendance affected operations?",
    "What should I prioritize this week?",
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/ai" className="mb-1 block text-sm text-slate-400 hover:text-white">
            ← Back to AI Hub
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={24} /> AI Business Analyst
          </h1>
          <p className="text-sm text-slate-400">
            Real-time multi-module reasoning grounded in your database records.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-emerald-400">
          <Database size={14} /> Live DB Engine Connected
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                msg.type === "user" ? "bg-indigo-600 text-white" : "bg-slate-800 text-indigo-400 border border-slate-700"
              }`}
            >
              {msg.type === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.type === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
              <Bot size={18} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800/90 border border-slate-700/60 px-5 py-3 text-xs text-indigo-400">
              <Loader2 size={16} className="animate-spin" /> Correlating financial ledgers, inventory velocity, and operational logs...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={(e) => handleSend(e, prompt)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300 transition hover:border-indigo-500 hover:text-white cursor-pointer"
          >
            {prompt} <ArrowRight size={12} className="text-slate-500" />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about revenue, expenses, stock, customers, or priorities..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>Ask Analyst</span>
        </button>
      </form>
    </div>
  );
}
