import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Search, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatArea({ currentUser, activeChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!activeChat) return;
    fetch('http://localhost:5000/api/messages/' + currentUser.id + '/' + activeChat.id)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [activeChat, currentUser]);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (activeChat && (msg.sender_id === activeChat.id || msg.sender_id === currentUser.id)) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [activeChat, socket, currentUser]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const sendCoreMessage = async (content) => {
    const msgData = { sender_id: currentUser.id, receiver_id: activeChat.id, content };
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      const savedMsg = await res.json();
      socket.emit('send_message', savedMsg);
      setMessages(prev => [...prev, savedMsg]);

    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    setShowEmoji(false);
    setShowAttach(false);
    await sendCoreMessage(newMessage);
    setNewMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      await sendCoreMessage(event.target.result);
    };
    reader.readAsDataURL(file);
    setShowAttach(false);
    e.target.value = null;
  };

  const triggerFileInput = (acceptType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  if (!activeChat) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 bg-[#f0f2f5] flex flex-col items-center justify-center text-center border-b-[6px] border-[#00a884] relative overflow-hidden"
      >
        {/* Decorative bg */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #00a884 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00a884 0%, transparent 40%)' }} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.12 }}
          transition={{ duration: 0.8 }}
          className="w-[280px] h-[280px] bg-[url('https://cdn0.iconfinder.com/data/icons/social-media-2092/100/social-45-512.png')] bg-no-repeat bg-center bg-contain mb-8"
        />
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-light text-[#41525d] mb-4"
        >
          Campus Connect
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#8696a0] text-[15px] max-w-sm leading-relaxed mb-6"
        >
          Select a contact to start chatting. All messages are automatically scanned by AI to extract important campus notices.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 bg-[#00a884]/10 border border-[#00a884]/20 text-[#00a884] px-4 py-2 rounded-full text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-powered notice extraction active</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] relative h-full">
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg')] bg-repeat" />

      {/* Header */}
      <div className="bg-[#f0f2f5] px-4 py-2.5 flex items-center justify-between border-l border-gray-200 z-10 shadow-sm">
        <div className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded-lg transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-lg mr-4 shadow-sm">
            {activeChat.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-[#111b21] text-[16px] font-medium">{activeChat.username}</h2>
            <p className="text-xs text-[#667781] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#54656f]">
          <div className="flex items-center gap-1 text-[11px] text-[#00a884] bg-[#00a884]/10 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>AI Extraction Active</span>
          </div>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors"><Search className="w-5 h-5" /></button>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 scrollbar-hide py-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === currentUser.id;

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.28, type: 'spring', stiffness: 220, damping: 22 }}
                key={i}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className={`relative px-[14px] py-[6px] rounded-lg max-w-[70%] sm:max-w-[65%] shadow-sm text-[15px] text-[#111b21] ${isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {msg.content.startsWith('data:image/') ? (
                    <div className="pr-10">
                      <img src={msg.content} alt="attachment" className="max-w-full max-h-[250px] rounded-lg mt-1 mb-1 object-contain" />
                    </div>
                  ) : msg.content.startsWith('data:') ? (
                    <a href={msg.content} download="attachment" className="flex items-center gap-3 text-[#00a884] font-medium pr-12 my-2 bg-black/5 hover:bg-black/10 p-3 rounded-lg transition-colors">
                      <FileText className="w-6 h-6" />
                      <span className="text-sm">Download Document</span>
                    </a>
                  ) : (
                    <div className="break-words pr-14 leading-relaxed">{msg.content}</div>
                  )}
                  <span className={`absolute bottom-[3px] right-2 text-[11px] ${isMe ? 'text-[#54656f]' : 'text-[#667781]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-3 z-10 relative">
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="absolute bottom-[70px] left-4 z-50 shadow-2xl rounded-xl overflow-hidden"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled skinTonesDisabled height={380} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAttach && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-[70px] left-[60px] z-50 bg-white rounded-2xl shadow-xl p-3 flex flex-col gap-2 min-w-[200px]"
            >
              <motion.button whileHover={{ scale: 1.02, x: 5 }} onClick={() => triggerFileInput('*/*')} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 rounded-full text-white shadow-sm"><FileText className="w-5 h-5" /></div>
                <span className="font-medium text-gray-700">Document</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02, x: 5 }} onClick={() => triggerFileInput('image/*,video/*')} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2.5 rounded-full text-white shadow-sm"><ImageIcon className="w-5 h-5" /></div>
                <span className="font-medium text-gray-700">Photos & Videos</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
          className={`p-2.5 rounded-full transition-all duration-300 text-[26px] ${showEmoji ? 'bg-[#d9fdd3] text-[#00a884] rotate-12' : 'hover:bg-gray-200 text-[#54656f]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </button>
        <button
          onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
          className={`p-2.5 rounded-full transition-all duration-300 ${showAttach ? 'bg-[#d9fdd3] text-[#00a884] -rotate-45' : 'hover:bg-gray-200 text-[#54656f]'}`}
        >
          <Paperclip className="w-[24px] h-[24px]" />
        </button>

        <form onSubmit={sendMessage} className="flex-1 flex gap-3 items-center ml-1">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onFocus={() => { setShowEmoji(false); setShowAttach(false); }}
            placeholder="Type a message — AI will scan for notices"
            className="flex-1 py-[11px] px-5 bg-white rounded-xl border-none outline-none text-[15px] text-[#111b21] placeholder-[#8696a0] shadow-sm focus:ring-1 focus:ring-[#00a884]/30"
          />
          <AnimatePresence>
            {newMessage.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-[#00a884] text-white shadow-md"
              >
                <Send className="w-[20px] h-[20px] ml-[3px]" />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
