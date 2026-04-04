import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trophy, Medal, Crown, User, Star, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/leaderboard`);
      setLeaders(res.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown size={32} className="text-amber-400" />;
      case 1: return <Medal size={28} className="text-slate-400" />;
      case 2: return <Medal size={28} className="text-amber-700" />;
      default: return <span className="text-lg font-black text-slate-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 rounded-3xl bg-primary-500/10 text-primary-500 mb-6"
        >
          <Trophy size={48} />
        </motion.div>
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">HALL OF FAME</h1>
        <p className="text-slate-500 uppercase tracking-widest font-bold text-sm">Compete with the world's best learners</p>
      </header>

      <div className="glass-card !p-0 overflow-hidden border-none shadow-2xl">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Rankings...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            <AnimatePresence mode='wait'>
              {leaders.map((player, index) => (
                <motion.div
                  key={player._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all ${index < 3 ? 'bg-primary-500/[0.02]' : ''}`}
                >
                  <div className="flex items-center gap-8">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl
                        ${index === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-800'}
                      `}>
                         {player.avatar ? <img src={player.avatar} alt="" /> : player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-lg flex items-center gap-2">
                          {player.username}
                          {index === 0 && <span className="text-[10px] bg-amber-400 text-white px-2 py-0.5 rounded-lg uppercase tracking-tighter font-black">Champion</span>}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black">Level {player.level}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-primary-500">
                      <Star size={20} fill="currentColor" />
                      <span className="text-3xl font-black tabular-nums">
                        {player.xp?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">XP Points</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <footer className="mt-12 flex flex-col items-center gap-4">
        <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Real-time synchronization active</p>
        </div>
      </footer>
    </div>
  );
};

export default Leaderboard;
