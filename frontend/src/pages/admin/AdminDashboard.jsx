import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Users, 
  Gamepad2, 
  Trophy, 
  UserCheck, 
  Clock,
  Activity as ActivityIcon,
  AlertCircle,
  RefreshCcw,
  TrendingUp
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setError('Connection Error: Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Syncing Real-time Stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Users', value: stats?.activeUsers, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Games Played', value: stats?.totalGames, icon: Gamepad2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Achievements', value: stats?.totalAchievements, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{stat.value?.toLocaleString() || 0}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <TrendingUp className="text-primary-500" size={22} /> User Activity (Daily)
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">Last 7 Days</span>
          </div>
          <div className="h-80 w-full">
            {stats?.weeklyActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 font-medium">No activity data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
            <Clock className="text-amber-500" size={22} /> Recent Logs
          </h3>
          <div className="space-y-6 flex-1">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity._id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ActivityIcon size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm leading-tight text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">{activity.username}</span> {activity.action}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ActivityIcon size={40} className="opacity-20 mb-2" />
                <p className="text-sm font-medium">Monitoring system activity...</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/activity')}
            className="w-full mt-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all duration-300"
          >
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
