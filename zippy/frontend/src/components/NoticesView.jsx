import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Calendar, AlertTriangle, CheckCircle, Filter, Clock,
  FileText, ChevronRight, Trash2, Sparkles, Sun, MessageCircle,
  BellRing, LayoutDashboard, Star, TrendingUp, Award, Zap
} from 'lucide-react';
import AIAssistant from './AIAssistant';
import DailyDigest from './DailyDigest';
import ReminderPanel from './ReminderPanel';

const CATEGORY_ICONS = {
  exam: '📝', assignment: '📚', fee: '💳', holiday: '🏖️',
  placement: '💼', event: '🎉', attendance: '📋', admission: '🎓',
  results: '🏆', other: '📌'
};

const PRIORITY_STYLES = {
  urgent: { card: 'border-l-4 border-l-red-500', badge: 'bg-red-100 text-red-700 border-red-200', glow: 'shadow-red-100' },
  high:   { card: 'border-l-4 border-l-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200', glow: 'shadow-orange-100' },
  medium: { card: 'border-l-4 border-l-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', glow: 'shadow-yellow-100' },
  low:    { card: 'border-l-4 border-l-green-400', badge: 'bg-green-100 text-green-700 border-green-200', glow: 'shadow-green-100' },
};

function daysLabel(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Overdue!', cls: 'text-red-600 font-bold' };
  if (diff === 0) return { label: 'Due today!', cls: 'text-red-500 font-semibold' };
  if (diff === 1) return { label: 'Tomorrow', cls: 'text-orange-500 font-medium' };
  if (diff <= 3) return { label: `${diff} days left`, cls: 'text-yellow-600' };
  return { label: `${diff} days`, cls: 'text-gray-400' };
}

const CATEGORIES = ['all', 'exam', 'assignment', 'fee', 'holiday', 'placement', 'event', 'attendance', 'admission', 'results', 'other'];

export default function NoticesView({ currentUser }) {
  const [notices, setNotices] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [importantOnly, setImportantOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showDigest, setShowDigest] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [addedReminders, setAddedReminders] = useState(new Set());
  const [activeView, setActiveView] = useState('feed'); // 'feed' | 'grid'

  useEffect(() => {
    fetch('http://localhost:5000/api/messages/notices/all')
      .then(res => res.json())
      .then(data => { setNotices(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/messages/notices/${id}`, { method: 'DELETE' });
      if (res.ok) setNotices(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const addReminder = async (e, notice) => {
    e.stopPropagation();
    if (!notice.deadline) return;
    try {
      await fetch('http://localhost:5000/api/messages/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notice_id: notice.id,
          user_id: currentUser.id,
          title: notice.title,
          deadline: notice.deadline,
          remind_at: '1 day before',
          priority: notice.priority
        })
      });
      setAddedReminders(prev => new Set([...prev, notice.id]));
    } catch {}
  };

  const filteredNotices = notices.filter(n => {
    if (importantOnly && n.priority !== 'high' && n.priority !== 'urgent') return false;
    if (filterCategory !== 'all' && n.category !== filterCategory) return false;
    return true;
  });

  const stats = {
    total: notices.length,
    urgent: notices.filter(n => n.priority === 'urgent').length,
    withDeadline: notices.filter(n => n.deadline).length,
    today: notices.filter(n => {
      const t = new Date(n.timestamp); const now = new Date();
      return t.toDateString() === now.toDateString();
    }).length,
  };

  const deadlines = notices.filter(n => n.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 6);

  return (
    <div className="flex-1 flex bg-[#f0f2f5] relative h-full overflow-hidden">

      {/* Modals */}
      <AnimatePresence>
        {showAssistant && <AIAssistant onClose={() => setShowAssistant(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDigest && <DailyDigest onClose={() => { setShowDigest(false); }} />}
      </AnimatePresence>
      <ReminderPanel userId={currentUser?.id} visible={showReminders} onClose={() => setShowReminders(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[17px] font-semibold text-[#111b21]">Campus Notice Board</h1>
                <p className="text-xs text-[#667781]">AI-powered · {stats.total} notices · {stats.withDeadline} with deadlines</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-[#f0f2f5] rounded-xl p-1 gap-1">
                <button onClick={() => setActiveView('feed')} className={`p-1.5 rounded-lg transition-all ${activeView === 'feed' ? 'bg-white shadow-sm text-[#00a884]' : 'text-gray-400'}`}>
                  <TrendingUp className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveView('grid')} className={`p-1.5 rounded-lg transition-all ${activeView === 'grid' ? 'bg-white shadow-sm text-[#00a884]' : 'text-gray-400'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowDigest(true)}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              >
                <Sun className="w-3.5 h-3.5" /> Digest
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowReminders(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors relative"
              >
                <BellRing className="w-3.5 h-3.5" /> Reminders
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowAssistant(true)}
                className="flex items-center gap-1.5 bg-[#00a884] hover:bg-[#007a63] text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Chat
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="bg-white border-b border-gray-100 px-6 py-2 shrink-0">
          <div className="flex gap-6">
            {[
              { label: 'Total', value: stats.total, icon: FileText, color: 'text-gray-500' },
              { label: 'Urgent', value: stats.urgent, icon: Zap, color: 'text-red-500' },
              { label: 'Deadlines', value: stats.withDeadline, icon: Calendar, color: 'text-blue-500' },
              { label: "Today's", value: stats.today, icon: Star, color: 'text-amber-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-xs text-gray-400">{label}:</span>
                <span className={`text-xs font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-100 px-4 py-2 shrink-0 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`shrink-0 flex items-center gap-1 capitalize px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                filterCategory === cat
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat !== 'all' && <span>{CATEGORY_ICONS[cat]}</span>}
              {cat}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 shrink-0 border-l pl-4">
            <span className="text-xs text-gray-500 whitespace-nowrap">High Priority</span>
            <button
              onClick={() => setImportantOnly(!importantOnly)}
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${importantOnly ? 'bg-[#00a884]' : 'bg-gray-300'}`}
            >
              <motion.div
                layout
                className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm"
                animate={{ x: importantOnly ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Notice Cards */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00a884]" />
              <p className="text-sm text-gray-400">Loading campus notices...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="w-14 h-14 mb-4 opacity-30" />
              <p className="text-base font-medium">No notices found</p>
              <p className="text-sm mt-1">Try changing the filter or send a message to extract notices</p>
            </div>
          ) : (
            <div className={activeView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              <AnimatePresence>
                {filteredNotices.map((notice, i) => {
                  const pStyle = PRIORITY_STYLES[notice.priority] || PRIORITY_STYLES.low;
                  const dl = daysLabel(notice.deadline);
                  const isUrgent = notice.priority === 'urgent';
                  const reminderAdded = addedReminders.has(notice.id);

                  return (
                    <motion.div
                      layout
                      key={notice.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                      className={`bg-white rounded-2xl shadow-sm ${pStyle.card} ${pStyle.glow} transition-all duration-200 group overflow-hidden`}
                    >
                      <div className="p-4">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg">{CATEGORY_ICONS[notice.category] || '📌'}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${pStyle.badge}`}>
                              {notice.priority}
                            </span>
                            <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-[11px] capitalize">
                              {notice.category}
                            </span>
                            {isUrgent && (
                              <motion.span
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex items-center gap-1 text-[11px] text-red-600 font-semibold"
                              >
                                <Zap className="w-3 h-3" /> URGENT
                              </motion.span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, notice.id)}
                            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Summary */}
                        <h3 className="text-[15px] font-semibold text-[#111b21] mb-1.5 leading-snug">{notice.title}</h3>
                        <p className="text-[13px] text-[#54656f] leading-relaxed mb-3">{notice.summary}</p>

                        {/* Deadline */}
                        {notice.deadline && (
                          <div className="flex items-center gap-2 bg-red-50/60 px-3 py-2 rounded-xl mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="text-xs text-red-600 font-medium">
                              Deadline: {notice.deadline}{notice.time ? ` at ${notice.time}` : ''}
                            </span>
                            {dl && <span className={`text-xs ml-auto ${dl.cls}`}>{dl.label}</span>}
                          </div>
                        )}

                        {/* Action */}
                        {notice.action_required && (
                          <div className="flex items-start gap-2 bg-[#d9fdd3]/40 px-3 py-2 rounded-xl mb-2">
                            <CheckCircle className="w-3.5 h-3.5 text-[#00a884] mt-0.5 shrink-0" />
                            <span className="text-xs text-[#00a884] font-medium">{notice.action_required}</span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            {notice.audience && (
                              <span className="text-[10px] text-gray-400">👥 {notice.audience}</span>
                            )}
                            <span className="text-[10px] text-gray-300">·</span>
                            <span className="text-[10px] text-gray-400">{new Date(notice.timestamp).toLocaleDateString('en-IN')}</span>
                          </div>
                          {notice.deadline && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => addReminder(e, notice)}
                              disabled={reminderAdded}
                              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                                reminderAdded
                                  ? 'bg-green-100 text-green-600 cursor-default'
                                  : 'bg-[#00a884]/10 text-[#00a884] hover:bg-[#00a884]/20'
                              }`}
                            >
                              {reminderAdded ? (
                                <><CheckCircle className="w-3 h-3" /> Added</>
                              ) : (
                                <><Bell className="w-3 h-3" /> Remind me</>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar — Deadlines + Quick Actions */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[280px] xl:w-[300px] bg-white border-l border-gray-200 hidden lg:flex flex-col h-full shrink-0"
      >
        {/* AI Actions */}
        <div className="p-4 border-b border-gray-100 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">AI Tools</p>
          <motion.button
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDigest(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:border-amber-300 transition-all text-left"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#111b21]">Daily Digest</p>
              <p className="text-xs text-gray-400">AI morning summary</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAssistant(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 hover:border-teal-300 transition-all text-left"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#00a884] to-[#007a63] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#111b21]">AI Assistant</p>
              <p className="text-xs text-gray-400">Ask about notices</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReminders(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 hover:border-rose-300 transition-all text-left"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
              <BellRing className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#111b21]">Reminders</p>
              <p className="text-xs text-gray-400">Track your deadlines</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
          </motion.button>
        </div>

        {/* Deadlines */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00a884]" />
            <h2 className="text-sm font-semibold text-[#111b21]">Upcoming Deadlines</h2>
          </div>

          <div className="px-4 pb-4 space-y-2">
            {deadlines.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No deadlines found.</p>
            ) : (
              deadlines.map((dl, i) => {
                const urgency = daysLabel(dl.deadline);
                return (
                  <motion.div
                    key={`dl-${dl.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ x: 2 }}
                    className="bg-white border border-rose-100 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-rose-400" />
                    <p className="text-[13px] font-medium text-[#111b21] leading-snug ml-2 mb-1 line-clamp-1">{dl.title}</p>
                    <div className="flex items-center gap-2 ml-2">
                      <Calendar className="w-3 h-3 text-rose-400" />
                      <span className="text-[11px] text-rose-500">{dl.deadline}</span>
                      {urgency && <span className={`text-[11px] ml-auto ${urgency.cls}`}>{urgency.label}</span>}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating AI Button (mobile) */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setShowAssistant(true)}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#00a884] to-[#007a63] text-white rounded-full shadow-[0_8px_24px_rgba(0,168,132,0.4)] flex items-center justify-center lg:hidden z-40"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
