import { useState } from 'react';
import { MessageSquare, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ setAuth, socket }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const res = await fetch('http://localhost:5000/api/auth/' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('whatsapp_user', JSON.stringify(data.user));
        setAuth(data.user);
        socket.emit('register', data.user.id);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      alert('Error connecting to Server');
    }
  };

  return (
    <div className="flex h-screen bg-[#111b21] items-center justify-center relative overflow-hidden">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute w-[200vw] h-[200vw] bg-teal-900/20 rounded-full blur-3xl -top-[100vw] -left-[50vw] pointer-events-none"
      ></motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#00a884]/40"
          >
            <MessageSquare className="text-white w-8 h-8" />
          </motion.div>
          <motion.h1 layout="position" className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h1>
          <motion.p layout="position" className="text-gray-300 mt-2 text-sm">
            {isLogin ? 'Enter your details to chat.' : 'Sign up to get started.'}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div layout="position" className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#00a884] transition-colors">
              <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#00a884] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full pl-12 p-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] focus:bg-black/30 text-white placeholder-gray-400 transition-all shadow-inner" 
              required 
            />
          </motion.div>
          
          <motion.div layout="position" className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00a884]">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#00a884] transition-colors" />
            </div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full pl-12 p-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] focus:bg-black/30 text-white placeholder-gray-400 transition-all shadow-inner" 
              required 
            />
          </motion.div>

          <motion.button 
            layout="position"
            whileHover={{ scale: 1.02, backgroundColor: '#029071' }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-[#00a884] text-white p-3 rounded-xl transition-all font-semibold shadow-lg shadow-[#00a884]/30 mt-4 overflow-hidden relative"
          >
            <AnimatePresence mode='wait'>
                <motion.span 
                  key={isLogin ? 'signin' : 'signup'}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
            </AnimatePresence>
          </motion.button>
        </form>

        <motion.div layout="position" className="mt-8 text-center">
          <p className="text-gray-400 text-sm flex gap-1 justify-center items-center">
            <AnimatePresence mode='wait'>
                <motion.span
                  key={isLogin ? 'text-signin' : 'text-signup'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </motion.span>
            </AnimatePresence>
            <button 
              type="button"
              className="text-[#00a884] hover:text-white font-medium transition-colors p-1" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
