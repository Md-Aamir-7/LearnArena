import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Search, 
  Filter, 
  Ban, 
  Edit, 
  Trash2, 
  UserPlus,
  ArrowUpDown
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}`, { isBanned: !currentStatus });
      fetchUsers();
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (error) {
        // Error handled by interceptor
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage and monitor all users in the system.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus size={20} />
          Add New User
        </button>
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="input-field pl-10 !py-2.5 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-sm font-medium">
              <Filter size={18} />
              Filter
            </button>
            <button className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-sm font-medium">
              <ArrowUpDown size={18} />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Level / XP</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">No users found.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold">{user.username}</p>
                        <p className="text-xs text-slate-500">{user._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold">Lvl {user.level}</span>
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${(user.xp % 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.isBanned ? 'badge-danger' : 'badge-success'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleBanUser(user._id, user.isBanned)}
                        className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${user.isBanned ? 'text-emerald-500' : 'text-amber-500'}`}
                        title={user.isBanned ? 'Unban User' : 'Ban User'}
                      >
                        <Ban size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
          <p>Showing {filteredUsers.length} users</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
