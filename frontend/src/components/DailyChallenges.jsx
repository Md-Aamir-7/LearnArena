import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Flame, Gift, Clock, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const DailyChallenges = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/gamification/daily-challenges');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch challenges', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      const res = await api.post(`/gamification/claim-daily/${id}`);
      toast.success(`Claimed ${res.data.xp} XP!`);
      fetchChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim');
    }
  };

  if (loading) return <div className="h-48 flex items-center justify-center">Loading quests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Zap size={24} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Daily Quests</h2>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl font-black text-sm">
          <Flame size={18} />
          {data?.streak || 0} DAY STREAK
        </div>
      </div>

      <div className="grid gap-4">
        {data?.currentChallenges.map((item) => (
          <div 
            key={item._id}
            className={`
              relative p-5 rounded-[2rem] border-2 transition-all duration-300
              ${item.isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/40 border-slate-800'}
            `}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className={`font-bold text-sm mb-1 ${item.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {item.challengeId.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-3">{item.challengeId.description}</p>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((item.progress / item.challengeId.requirement) * 100, 100)}%` }}
                    className={`h-full ${item.isCompleted ? 'bg-emerald-500' : 'bg-primary-500'}`}
                  />
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-amber-500 font-black text-xs bg-amber-500/10 px-2 py-1 rounded-lg">
                  <Gift size={12} /> +{item.challengeId.rewardXp} XP
                </div>
                
                {item.isClaimed ? (
                  <div className="text-emerald-500 flex items-center gap-1 text-xs font-black">
                    <CheckCircle2 size={14} /> CLAIMED
                  </div>
                ) : item.isCompleted ? (
                  <button 
                    onClick={() => handleClaim(item._id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    CLAIM
                  </button>
                ) : (
                  <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                    {item.progress} / {item.challengeId.requirement}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] justify-center mt-4">
        <Clock size={12} /> Resets in 14h 22m
      </div>
    </div>
  );
};

export default DailyChallenges;
