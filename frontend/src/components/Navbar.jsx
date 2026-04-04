import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gamepad2, Trophy, User, LogOut, 
  LayoutDashboard, PlayCircle, ShieldCheck,
  Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const NavLinks = () => (
    <>
      <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
        <LayoutDashboard size={18} /> <span>Dashboard</span>
      </Link>
      <Link to="/games" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
        <PlayCircle size={18} /> <span>Games</span>
      </Link>
      <Link to="/leaderboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
        <Trophy size={18} /> <span>Leaderboard</span>
      </Link>
      
      {(user?.role === 'admin' || user?.role === 'moderator') && (
        <Link to="/admin" className="text-primary-500 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <ShieldCheck size={18} /> <span>Admin</span>
        </Link>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <div className="flex items-center justify-between w-full lg:w-auto">
        <Link to="/" className="nav-brand">
          <Gamepad2 className="animate-float" />
          <span>EduPlay</span>
        </Link>

        {/* Mobile Toggle */}
        <button onClick={toggleMenu} className="lg:hidden text-slate-500 dark:text-slate-400 p-2">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      
      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-8">
        <div className="nav-links">
          {user && <NavLinks />}
        </div>

        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-8 h-8 rounded-full border-2 border-primary-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                    <User size={18} />
                  </div>
                )}
                <div className="hidden xl:block">
                  <p className="text-sm font-bold leading-tight">{user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Level {user.level}</p>
                </div>
              </div>
              <button onClick={logout} className="btn-secondary !px-3 !py-1.5 flex items-center gap-2 text-sm">
                <LogOut size={16} /> <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-semibold">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden w-full absolute top-20 left-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {user ? (
                <>
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black">{user.username}</p>
                      <p className="text-xs text-slate-500">Level {user.level} Player</p>
                    </div>
                  </div>
                  <NavLinks />
                  <button onClick={logout} className="btn-secondary w-full justify-start">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary w-full">Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
