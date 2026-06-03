import { useState, useEffect } from 'react';
import { Search, MoreVertical, MessageSquarePlus, LogOut, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ currentUser, activeChat, setActiveChat }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/users')
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => u.id !== currentUser.id)))
      .catch(console.error);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`http://localhost:5000/api/messages/reminders/${currentUser.id}`)
      .then(r => r.json())
      .then(d => setReminderCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, [currentUser]);

  return (
    <div className="w-[30%] lg:w-[35%] xl:w-[400px] border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#f0f2f5] px-4 py-3 shrink-0 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm cursor-pointer"
          >
            {currentUser.username[0].toUpperCase()}
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#111b21]">{currentUser.username}</p>
            <div className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#00a884]" />
              <p className="text-[10px] text-[#00a884]">AI Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <MessageSquarePlus className="w-5 h-5 cursor-pointer hover:text-gray-800 transition" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-800 transition" />
          <LogOut
            className="w-5 h-5 cursor-pointer hover:text-red-500 transition"
            onClick={() => { localStorage.clear(); window.location.reload(); }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-2 border-b border-gray-200">
        <motion.div
          animate={{ backgroundColor: isFocused ? '#ffffff' : '#f0f2f5', boxShadow: isFocused ? '0 2px 4px rgba(0,0,0,0.08)' : 'none' }}
          className="flex items-center px-4 py-1.5 rounded-xl overflow-hidden border border-transparent focus-within:border-[#00a884]"
        >
          <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-[#00a884]' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full bg-transparent p-2 text-[15px] outline-none placeholder-gray-500 ml-2 text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </motion.div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">

        {/* Campus Notices Pinned Tab */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveChat({ id: 'notices', username: 'Notice Board' })}
          className={`flex items-center px-4 py-[12px] cursor-pointer transition-colors duration-200 group relative border-b border-gray-100 ${activeChat?.id === 'notices' ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex shrink-0 items-center justify-center shadow-sm mr-4 relative"
          >
            <Bell className="w-6 h-6" />
            {reminderCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-[9px] font-bold">{reminderCount}</span>
              </motion.div>
            )}
          </motion.div>
          <div className="flex-1 pb-1">
            <div className="flex justify-between items-center">
              <h3 className="text-[17px] text-[#111b21] font-semibold leading-5">Campus Notices</h3>
              <span className="text-[11px] bg-[#00a884] text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-[14px] text-[#00a884] font-medium mt-0.5">
              Notices · Reminders · Assistant
            </p>
          </div>
        </motion.div>

        <AnimatePresence>
          {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map((user, index) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              key={user.id}
              onClick={() => setActiveChat(user)}
              className={`flex items-center px-4 py-[10px] cursor-pointer transition-colors duration-200 group relative ${activeChat?.id === user.id ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a884] to-[#128c7e] text-white flex shrink-0 items-center justify-center font-bold text-xl mr-4 shadow-sm"
              >
                {user.username[0].toUpperCase()}
              </motion.div>
              <div className="flex-1 border-b border-gray-100 pb-3 mt-3 pr-2 group-last:border-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-[17px] text-[#111b21] leading-5 font-normal">{user.username}</h3>
                  <span className={`text-xs ${activeChat?.id === user.id ? 'text-[#00a884] font-medium' : 'text-gray-400'} flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Online
                  </span>
                </div>
                <p className="text-[13px] text-[#667781] mt-0.5 truncate max-w-[200px] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#00a884] shrink-0" />
                  AI notice scanning active
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
