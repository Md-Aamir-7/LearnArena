import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Award, Star, Zap, ChevronRight, Trophy, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import DailyChallenges from '../components/DailyChallenges';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const nextLevelXp = user.level * 100;
  const xpPercentage = Math.min((user.xp / nextLevelXp) * 100, 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 py-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Hello, <span className="text-gradient">{user.username}</span>! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Great to see you again. Ready for some challenges?</p>
        </div>
        <div className="flex gap-3">
          <Link to="/skill-tree" className="glass-card !py-3 !px-5 flex items-center gap-3 hover:bg-primary-500/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
              <GitBranch size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Skill Tree</p>
              <p className="font-bold text-sm">View Progress</p>
            </div>
          </Link>
          <div className="glass-card !py-3 !px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Rank</p>
              <p className="font-bold"># {user.rank || 124}</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Daily Challenges - New */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1 glass-card overflow-hidden">
          <DailyChallenges />
        </motion.div>

        {/* Progress Card */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 glass-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                <Zap size={30} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Level {user.level} Progress</h2>
                <p className="text-slate-500">{user.xp} / {nextLevelXp} XP</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span>Next Level</span>
                <span className="text-primary-500">{Math.round(xpPercentage)}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-400 to-indigo-500 rounded-full shadow-sm"
                ></motion.div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
                You need <span className="text-primary-500 font-bold">{nextLevelXp - user.xp} more XP</span> to reach Level {user.level + 1}!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Achievements Card */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Award size={24} />
              </div>
              <h2 className="text-xl font-bold">Recent Achievements</h2>
            </div>
            <button className="text-primary-500 font-bold text-sm hover:underline">View All</button>
          </div>

          {user.achievements && user.achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {user.achievements.map((ach, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold text-center">{ach}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">No achievements yet. Start playing to unlock them!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
