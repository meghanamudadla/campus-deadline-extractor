import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, X, Loader2, MessageCircle } from 'lucide-react';

const QUICK_QUESTIONS = [
  "What's due this week?",
  "Any urgent notices?",
  "Summarize today's updates",
  "Any holiday this week?",
  "What exams are coming?",
];

export default function AIAssistant({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your Campus AI Assistant 🎓\n\nAsk me anything about notices, deadlines, exams, or upcoming events. I search through all campus notices to give you quick answers.",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    const userMsg = { role: 'user', text: question, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/messages/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect. Please try again.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full sm:w-[480px] sm:max-h-[85vh] h-[90vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00a884] to-[#007a63] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-[16px]">Campus AI Assistant</h2>
              <p className="text-white/70 text-xs">Powered by AI · Searches all notices</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Quick Questions */}
        <div className="px-4 py-3 bg-[#f8fffe] border-b border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Quick Questions</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="shrink-0 text-xs bg-[#e8f8f4] text-[#00a884] px-3 py-1.5 rounded-full font-medium hover:bg-[#d1f3eb] transition-colors border border-[#00a884]/20"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#f0f2f5]">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a884] to-[#007a63] flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-sm'
                    : 'bg-white text-[#111b21] rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5 text-right">
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a884] to-[#007a63] flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#00a884] animate-spin" />
                  <span className="text-sm text-gray-400">Searching notices...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <div className="flex-1 bg-[#f0f2f5] rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about exams, deadlines, notices..."
                className="flex-1 bg-transparent text-[14px] text-[#111b21] outline-none placeholder-gray-400"
                autoFocus
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center shrink-0 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white ml-0.5" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
