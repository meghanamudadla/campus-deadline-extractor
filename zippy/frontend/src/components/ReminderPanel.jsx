import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Bell, CheckCircle, AlertCircle, Calendar, ChevronRight } from 'lucide-react';

const PRIORITY_RING = {
  urgent: 'ring-red-400 bg-red-50',
  high: 'ring-orange-400 bg-orange-50',
  medium: 'ring-yellow-400 bg-yellow-50',
  low: 'ring-green-400 bg-green-50',
};

function daysUntil(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function urgencyLabel(days) {
  if (days === null) return null;
  if (days < 0) return { label: 'Overdue!', color: 'text-red-600 font-bold' };
  if (days === 0) return { label: 'Due today!', color: 'text-red-500 font-semibold' };
  if (days === 1) return { label: 'Due tomorrow', color: 'text-orange-500 font-medium' };
  if (days <= 3) return { label: `${days} days left`, color: 'text-yellow-600 font-medium' };
  return { label: `${days} days left`, color: 'text-gray-500' };
}

export default function ReminderPanel({ userId, visible, onClose }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !visible) return;
    fetch(`http://localhost:5000/api/messages/reminders/${userId}`)
      .then(r => r.json())
      .then(d => { setReminders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId, visible]);

  const dismiss = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/messages/reminders/${id}/dismiss`, { method: 'PATCH' });
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="w-full sm:w-[360px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">My Reminders</h2>
                  <p className="text-white/70 text-xs">{reminders.length} active</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-[#f8f9fa]">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
                </div>
              ) : reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CheckCircle className="w-12 h-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">All clear!</p>
                  <p className="text-xs mt-1">No pending reminders</p>
                </div>
              ) : (
                <AnimatePresence>
                  {reminders.map((r, i) => {
                    const days = daysUntil(r.deadline);
                    const urgency = urgencyLabel(days);
                    const ring = PRIORITY_RING[r.priority] || PRIORITY_RING.medium;
                    const isOverdue = days !== null && days < 0;

                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-white rounded-2xl p-4 shadow-sm border ring-1 ${ring} relative overflow-hidden`}
                      >
                        {isOverdue && (
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500" />
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isOverdue ? (
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                              ) : (
                                <Calendar className="w-4 h-4 text-[#00a884] shrink-0" />
                              )}
                              <p className="text-[#111b21] font-medium text-sm leading-snug truncate">{r.title}</p>
                            </div>
                            {r.deadline && (
                              <p className="text-xs text-gray-400 mb-1 ml-6">📅 {r.deadline}</p>
                            )}
                            {urgency && (
                              <p className={`text-xs ml-6 ${urgency.color}`}>{urgency.label}</p>
                            )}
                            <div className="mt-2 ml-6 flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-[11px] text-gray-400">{r.remind_at}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize font-medium ${
                                r.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                r.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                r.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>{r.priority}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => dismiss(r.id)}
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 flex items-center justify-center transition-colors shrink-0 text-gray-400"
                            title="Mark done"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 shrink-0">
              <p className="text-xs text-gray-400 text-center">
                Reminders auto-created from AI extracted notices
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
