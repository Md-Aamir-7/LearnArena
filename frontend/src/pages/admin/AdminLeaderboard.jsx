import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trophy, RotateCcw, Star, Medal, Crown, User, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminLeaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/users/leaderboard');
      setLeaders(res.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    if (window.confirm('⚠️ CRITICAL ACTION: This will reset XP and Levels for ALL users. This cannot be undone. Proceed?')) {
      setResetting(true);
      try {
        await api.post('/admin/leaderboard/reset');
        toast.success('Leaderboard reset successful');
        fetchLeaderboard();
      } catch (error) {
        toast.error('Failed to reset leaderboard');
      } finally {
        setResetting(false);
      }
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown size={24} className="text-amber-400" />;
      case 1: return <Medal size={22} className="text-slate-400" />;
      case 2: return <Medal size={22} className="text-amber-700" />;
      default: return <User size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gradient">LEADERBOARD CONTROL</h2>
          <p className="text-slate-500 font-medium text-sm">Monitor global rankings and manage competition cycles.</p>
        </div>
        <button 
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-rose-100 dark:border-rose-900/30 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-50"
        >
          <RotateCcw size={18} className={resetting ? 'animate-spin' : ''} />
          {resetting ? 'Resetting...' : 'Reset Monthly Cycle'}
        </button>
      </div>

      {leaders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card !p-0 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                Current Rankings
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full animate-pulse">Live Updating</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rank</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Player</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progress</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaders.map((player, index) => (
                    <tr key={player._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex justify-center w-8">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm">
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{player.username}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{player._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Level {player.level}</span>
                          <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: `${(player.xp % 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-700 dark:text-slate-200 tabular-nums">
                        {player.xp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card bg-primary-500 text-white border-none shadow-primary-500/20">
              <Trophy size={40} className="mb-4 opacity-50" />
              <h4 className="text-xl font-black mb-2 uppercase tracking-tight">Top Performer</h4>
              <p className="text-primary-100 text-sm font-medium mb-6">Highest XP earner this cycle.</p>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-widest opacity-70">Current #1</p>
                <p className="text-2xl font-black mt-1">{leaders[0].username}</p>
                <div className="flex items-center gap-2 mt-2 text-primary-100 font-bold">
                  <Star size={14} fill="currentColor" />
                  {leaders[0].xp.toLocaleString()} XP
                </div>
              </div>
            </div>

            <div className="glass-card border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-10">
              <AlertCircle size={32} className="text-slate-300 mb-4" />
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Stats Summary</h4>
              <p className="text-2xl font-black mt-4 text-slate-300">{leaders.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Ranked Players</p>
            </div>
          </div>
        </div>
      )}

      {leaders.length === 0 && !loading && (
        <div className="glass-card text-center py-20">
          <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold">No active rankings yet for this cycle.</p>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboard;
