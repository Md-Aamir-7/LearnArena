import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Lock, 
  CheckCircle2, 
  Play, 
  Trophy, 
  ArrowLeft,
  ChevronRight,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Keep the levels static data as a fallback or for structure reference if needed, 
// but we will primarily use database levels now.
export const PYTHON_LEVELS = [
  { id: 1, title: 'Variables', concept: 'Storing data', icon: '📦' },
  { id: 2, title: 'Data Types', concept: 'Strings & Numbers', icon: '🔢' },
  { id: 3, title: 'Operators', concept: 'Calculations', icon: '➕' },
  { id: 4, title: 'Lists', concept: 'Collections', icon: '📝' },
  { id: 5, title: 'Conditions', concept: 'If/Else Logic', icon: '🔀' },
  { id: 6, title: 'Loops', concept: 'Repeat actions', icon: '🔁' },
  { id: 7, title: 'Functions', concept: 'Reusable code', icon: '⚙️' },
];

const PythonAdventure = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [completedLevels, setCompletedLevels] = useState([]);
  const [dbLevels, setDbLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.pythonProgress?.completedLevels) {
      setCompletedLevels(user.pythonProgress.completedLevels);
    }
    fetchLevels();
  }, [user]);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/admin/python-levels');
      setDbLevels(res.data);
    } catch (error) {
      console.error('Failed to fetch levels', error);
    } finally {
      setLoading(false);
    }
  };

  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true;
    return completedLevels.includes(levelId - 1);
  };

  const isLevelCompleted = (levelId) => {
    return completedLevels.includes(levelId);
  };

  const handleLevelClick = (levelId) => {
    if (isLevelUnlocked(levelId)) {
      navigate(`/games/python/level/${levelId}`);
    }
  };

  const activeLevels = dbLevels.length > 0 ? dbLevels : PYTHON_LEVELS;

  const calculateProgress = () => {
    if (activeLevels.length === 0) return 0;
    return Math.round((completedLevels.length / activeLevels.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <button 
          onClick={() => navigate('/games')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center group-hover:bg-slate-800">
            <ArrowLeft size={20} />
          </div>
          <span className="font-bold uppercase tracking-widest text-xs">Back to Games</span>
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-gradient flex items-center justify-center gap-3">
            <Code size={36} className="text-rose-500" /> PYTHON ADVENTURE
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Master the art of coding</p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
            <p className="text-xl font-black text-rose-500">{calculateProgress()}%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Trophy size={24} />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto mb-16 h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${calculateProgress()}%` }}
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
        ></motion.div>
      </div>

      {/* Level Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-900/50 rounded-[2rem] border-2 border-slate-800 animate-pulse"></div>
          ))
        ) : activeLevels.map((level, index) => {
          const lId = level.levelId || level.id;
          const unlocked = isLevelUnlocked(lId);
          const completed = isLevelCompleted(lId);
          const isCurrent = unlocked && !completed && (index === 0 || isLevelCompleted(activeLevels[index-1].levelId || activeLevels[index-1].id));

          return (
            <motion.div
              key={lId}
              whileHover={unlocked ? { y: -5, scale: 1.02 } : {}}
              onClick={() => handleLevelClick(lId)}
              className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden
                ${unlocked 
                  ? 'bg-slate-900/40 border-slate-800 hover:border-rose-500/50' 
                  : 'bg-slate-950 border-slate-900 opacity-60 cursor-not-allowed'}
                ${isCurrent ? 'ring-2 ring-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : ''}
              `}
            >
              {/* Background Glow */}
              {unlocked && (
                <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 ${completed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                  ${unlocked ? 'bg-slate-800' : 'bg-slate-900'}
                `}>
                  {unlocked ? level.icon : <Lock size={24} className="text-slate-700" />}
                </div>
                {completed && (
                  <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level {lId}</p>
                <h3 className="text-xl font-bold tracking-tight">{level.title}</h3>
                <p className="text-slate-500 text-sm font-medium">{level.concept}</p>
              </div>

              <div className="mt-8">
                {unlocked ? (
                  <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest
                    ${completed ? 'text-emerald-500' : 'text-rose-500'}
                  `}>
                    {completed ? 'Replay Level' : 'Play Level'}
                    <ChevronRight size={14} />
                  </div>
                ) : (
                  <div className="text-slate-700 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} /> Locked
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="max-w-4xl mx-auto mt-20 text-center text-slate-600">
        <p className="text-sm font-medium">Unlock all levels to earn the <span className="text-rose-500 font-bold">Python Master</span> badge!</p>
      </div>
    </div>
  );
};

export default PythonAdventure;
