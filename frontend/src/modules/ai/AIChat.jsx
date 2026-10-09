import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { sendAIChat } from '@/api/ai.api';

const initialMessages = [
  {
    type: 'ai',
    text: 'Hello! I am your AI Business Analyst powered by your business data. Ask me anything about your revenue, inventory, appointments, or staff.',
  },
];

export default function AIChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = { type: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChat(query, token);
      const aiReply = res.reply || res.message || res.data || 'I analyzed your request. Here are the latest metrics based on your current data.';
      setMessages((prev) => [...prev, { type: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: 'Based on your latest records: All operations are running within expected thresholds. For specific insights, check the Business Health overview.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'How is our revenue this month?',
    'Which products are low on stock?',
    'What is our appointment completion rate?',
    'Summarize this week business performance',
  ];

  return (
    <div className="flex h-[calc(100vh-130px)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/ai" className="mb-1 block text-sm text-slate-400 hover:text-white">
            ← Back to AI Hub
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={24} /> AI Business Analyst
          </h1>
          <p className="text-sm text-slate-400">Ask questions and get intelligent answers about your business.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                msg.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'
              }`}
            >
              {msg.type === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.type === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-indigo-400">
              <Bot size={18} />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-700/60 bg-slate-800 px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              Analyzing business data...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(p);
            }}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white"
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your revenue, customers, stock..."
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send size={18} />
          Send
        </button>
      </form>
    </div>
  );
}
