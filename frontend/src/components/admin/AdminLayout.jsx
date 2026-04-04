import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Games', icon: Gamepad2, path: '/admin/games' },
    { name: 'Quizzes', icon: BookOpen, path: '/admin/quizzes' },
    { name: 'Achievements', icon: Trophy, path: '/admin/achievements' },
    { name: 'Leaderboard', icon: BarChart3, path: '/admin/leaderboard' },
    { name: 'Activity Log', icon: Clock, path: '/admin/activity' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <span className="text-xl font-black tracking-tighter text-primary-500 uppercase">EduAdmin</span>
        <button 
          onClick={() => isMobileOpen ? setIsMobileOpen(false) : setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:block hidden"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            end={item.path === '/admin'}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
              }`
            }
          >
            <item.icon size={22} className="shrink-0" />
            {(isSidebarOpen || isMobileOpen) && <span className="whitespace-nowrap font-bold text-sm uppercase tracking-widest">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <LogOut size={22} className="shrink-0" />
          {(isSidebarOpen || isMobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col sticky top-0 h-screen z-50 transition-all duration-300 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 ${isSidebarOpen ? 'w-64' : 'w-24'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 z-[70] flex flex-col lg:hidden border-r border-slate-200 dark:border-slate-800"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-1 uppercase tracking-tighter">
              Admin / <span className="text-primary-500 font-black">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:ring-2 ring-primary-500/50 transition-all"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/" className="text-xs md:text-sm font-black text-primary-500 hover:underline uppercase tracking-widest px-2">Site</Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
