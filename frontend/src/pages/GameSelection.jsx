import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { 
  Calculator, 
  Puzzle, 
  BrainCircuit, 
  ChevronRight, 
  Zap, 
  Trophy,
  Target,
  Users,
  Terminal,
  BookOpen,
  Gamepad2
} from 'lucide-react';

const CountUp = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const duration = 1500; // 1.5 seconds
    const frameRate = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameRate);
    const increment = end / totalFrames;
    
    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      const nextValue = Math.round(increment * currentFrame);
      
      if (currentFrame >= totalFrames) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(nextValue);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const GameSelection = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ topScore: 0, onlineCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [gamesRes, statsRes] = await Promise.all([
        api.get('/admin/games'),
        api.get('/users/public-stats')
      ]);
      // Only show enabled games
      setGames(gamesRes.data.filter(g => g.isEnabled));
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const getLucideIcon = (name) => {
    const icons = {
      Calculator, 
      Puzzle, 
      BrainCircuit, 
      Terminal,
      BookOpen,
      Zap,
      Gamepad2
    };
    const Icon = icons[name] || Gamepad2;
    return <Icon size={48} strokeWidth={2.5} />;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-gradient">
          CHOOSE A GAME
        </h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-sm">
          <Target size={18} className="text-primary-500" />
          Select a challenge to start earning XP
        </div>
      </motion.div>

      {/* Games Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          ))
        ) : games.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-500">No games available at the moment.</div>
        ) : games.map((game) => (
          <motion.div
            key={game._id}
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group relative cursor-pointer"
            onClick={() => navigate(game.path)}
          >
            {/* Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${
              game.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
              game.color === 'primary' ? 'from-primary-500 to-indigo-500' :
              game.color === 'rose' ? 'from-rose-500 to-pink-500' :
              'from-amber-500 to-orange-500'
            } rounded-[2rem] blur opacity-20 group-hover:opacity-60 transition duration-500`}></div>
            
            {/* Card Content */}
            <div className="relative glass-card !p-10 h-full flex flex-col items-center text-center border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl">
              
              {/* Icon Section */}
              <div className={`mb-8 p-6 rounded-3xl ${
                game.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                game.color === 'primary' ? 'bg-primary-500/10 text-primary-500' :
                game.color === 'rose' ? 'bg-rose-500/10 text-rose-500' :
                'bg-amber-500/10 text-amber-500'
              } transition-transform group-hover:scale-110 duration-500`}>
                {getLucideIcon(game.icon)}
              </div>

              {/* Text Section */}
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-primary-500 transition-colors pb-1">
                  {game.name}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm px-4 line-clamp-2">
                  {game.description}
                </p>
                <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-sm">
                  <Zap size={14} fill="currentColor" /> +{game.xpReward} XP Reward
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-10 w-full">
                <div className={`inline-flex items-center gap-2 bg-${game.color === 'primary' ? 'primary' : game.color}-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all`}>
                  Play Now
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Decorative Background Element */}
              <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-10 ${
                game.color === 'emerald' ? 'bg-emerald-500' :
                game.color === 'primary' ? 'bg-primary-500' :
                game.color === 'rose' ? 'bg-rose-500' :
                'bg-amber-500'
              }`}></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Global Stats Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto"
      >
        <div className="glass-card !p-6 flex items-center justify-center gap-6 border-none bg-slate-50 dark:bg-slate-900/50 rounded-3xl shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Global Top Score</p>
            <p className="text-3xl font-black tabular-nums">
              {loading ? "..." : <CountUp value={stats.topScore} />}
            </p>
          </div>
        </div>

        <div className="glass-card !p-6 flex items-center justify-center gap-6 border-none bg-slate-50 dark:bg-slate-900/50 rounded-3xl shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Players Online</p>
            <p className="text-3xl font-black tabular-nums">
              {loading ? "..." : <CountUp value={stats.onlineCount} />}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameSelection;
