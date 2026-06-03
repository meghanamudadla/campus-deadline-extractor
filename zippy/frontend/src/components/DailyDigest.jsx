import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, AlertTriangle, Calendar, TrendingUp, X, Loader2, ChevronRight, Bell } from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DailyDigest({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/messages/digest')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="w-full max-w-[520px] max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-[#00a884] via-[#00c49a] to-[#007a63] px-6 pt-6 pb-8 overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute top-4 right-16 w-16 h-16 bg-white/10 rounded-full" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sun className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Daily Digest</p>
              <h1 className="text-white text-xl font-semibold">{getGreeting()}! ☀️</h1>
            </div>
          </div>
          <p className="text-white/90 text-sm leading-relaxed relative z-10">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#00a884] mb-3" />
              <p className="text-sm">Building your digest...</p>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-40" />
              <p>No data available</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* AI Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-[#f0fdf9] to-[#e8f8f4] border border-[#00a884]/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#00a884]" />
                  <span className="text-xs font-semibold text-[#00a884] uppercase tracking-wide">AI Summary</span>
                </div>
                <p className="text-[#111b21] text-[14px] leading-relaxed">{data.digest}</p>
                <p className="text-xs text-gray-400 mt-2">{data.total} total notices found</p>
              </motion.div>

              {/* Urgent Alerts */}
              {data.urgent?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-[#111b21]">Urgent Alerts</h3>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">{data.urgent.length}</span>
                  </div>
                  <div className="space-y-2">
                    {data.urgent.map((n, i) => {
                      const cfg = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.medium;
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.05 }}
                          className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 flex items-start gap-3`}
                        >
                          <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${cfg.text} leading-snug`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{n.summary}</p>
                          </div>
                          <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} shrink-0`}>{n.priority}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Upcoming Deadlines */}
              {data.deadlines?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-[#111b21]">Upcoming Deadlines</h3>
                  </div>
                  <div className="space-y-2">
                    {data.deadlines.map((n, i) => (
                      <motion.div
                        key={`d-${n.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111b21] truncate">{n.title}</p>
                          <p className="text-xs text-blue-500 font-medium mt-0.5">{n.deadline}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {!data.urgent?.length && !data.deadlines?.length && (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No urgent items today. You're all caught up! 🎉</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#00a884] text-white py-3 rounded-2xl font-medium text-sm hover:bg-[#007a63] transition-colors"
          >
            View Full Notice Board
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
