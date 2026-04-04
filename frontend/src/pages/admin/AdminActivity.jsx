import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Gamepad2, 
  Trophy, 
  Clock,
  Activity as ActivityIcon,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchName] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/activity?page=${page}&type=${filterType}&username=${searchTerm}`);
      setActivities(res.data.activities);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch activity log', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, filterType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchActivities();
  };

  const formatFullDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gradient">ACTIVITY LOG</h2>
          <p className="text-slate-500 font-medium">Monitor all user actions in real-time</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search username..."
              value={searchTerm}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary-500 outline-none transition-all w-64 font-medium"
            />
          </form>

          <select 
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary-500 outline-none transition-all font-bold text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400"
          >
            <option value="">All Actions</option>
            <option value="Game">Games</option>
            <option value="Quiz">Quizzes</option>
            <option value="Achievement">Achievements</option>
            <option value="LevelUp">Level Ups</option>
          </select>
        </div>
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">User</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Type</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-8 py-6">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                          {activity.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{activity.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {activity.action}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        activity.type === 'Game' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        activity.type === 'Quiz' ? 'bg-primary-50 text-primary-600 border-primary-200' :
                        activity.type === 'Achievement' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-bold text-slate-400 tabular-nums">
                      {formatFullDate(activity.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium">
                    No activity logs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page === totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;
