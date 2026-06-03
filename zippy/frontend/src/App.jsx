import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Login from './components/Login';
import NoticesView from './components/NoticesView';
import AIAssistant from './components/AIAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const socket = io('http://localhost:5000');

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [showGlobalAssistant, setShowGlobalAssistant] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('whatsapp_user'));
    if (user) {
      setCurrentUser(user);
      socket.emit('register', user.id);
    }
  }, []);

  if (!currentUser) return <Login setAuth={setCurrentUser} socket={socket} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen w-full bg-[#d1d7db] font-sans relative overflow-hidden"
    >
      {/* WhatsApp Web Style Background Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-0 w-full h-[127px] bg-[#00a884] shadow-sm z-0"
      />

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 100 }}
        className="flex w-[100vw] h-[100vh] sm:w-[94vw] sm:h-[92vh] max-w-[1700px] shadow-[0_12px_24px_rgba(0,0,0,0.1)] bg-white sm:rounded-lg m-auto z-10 overflow-hidden border border-gray-200"
      >
        <Sidebar
          currentUser={currentUser}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          socket={socket}
        />
        {activeChat?.id === 'notices' ? (
          <NoticesView currentUser={currentUser} />
        ) : (
          <ChatArea
            currentUser={currentUser}
            activeChat={activeChat}
            socket={socket}
          />
        )}
      </motion.div>

      {/* Global AI Assistant Modal */}
      <AnimatePresence>
        {showGlobalAssistant && <AIAssistant onClose={() => setShowGlobalAssistant(false)} />}
      </AnimatePresence>

      {/* Global floating AI button (only when not in NoticesView which has its own) */}
      {activeChat?.id !== 'notices' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowGlobalAssistant(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-[#00a884] to-[#007a63] text-white rounded-full shadow-[0_6px_20px_rgba(0,168,132,0.45)] flex items-center justify-center z-30 hidden sm:flex"
          title="Ask AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>
      )}
    </motion.div>
  );
}

export default App;
