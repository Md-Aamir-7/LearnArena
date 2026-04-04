import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const AdminAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Trophy',
    conditionType: 'level',
    conditionValue: 1
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get('/admin/achievements');
      setAchievements(res.data);
    } catch (error) {
      toast.error('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ach = null) => {
    if (ach) {
      setEditingAchievement(ach);
      setFormData({
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        conditionType: ach.conditionType,
        conditionValue: ach.conditionValue
      });
    } else {
      setEditingAchievement(null);
      setFormData({
        name: '',
        description: '',
        icon: 'Trophy',
        conditionType: 'level',
        conditionValue: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAchievement) {
        await api.put(`/admin/achievements/${editingAchievement._id}`, formData);
        toast.success('Badge updated successfully!');
      } else {
        await api.post('/admin/achievements', formData);
        toast.success('Badge created successfully!');
      }
      setIsModalOpen(false);
      fetchAchievements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const deleteAchievement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) return;
    try {
      // Assuming a delete route exists or adding it to backend if needed
      await api.delete(`/admin/achievements/${id}`);
      toast.success('Badge deleted');
      fetchAchievements();
    } catch (error) {
      toast.error('Failed to delete badge');
    }
  };

  const getIcon = (iconName, color = 'amber') => {
    const icons = { Trophy, Star, Zap, Target };
    const IconComponent = icons[iconName] || Trophy;
    return <IconComponent size={32} />;
  };

  const getColor = (type) => {
    switch (type) {
      case 'level': return 'emerald';
      case 'xp': return 'amber';
      case 'score': return 'primary';
      case 'gamesPlayed': return 'indigo';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements & Rewards</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage badges and unlockable rewards.</p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Create Badge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500">Loading achievements...</div>
        ) : achievements.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-500">No badges found. Create your first one!</div>
        ) : achievements.map(ach => (
          <div key={ach._id} className="glass-card relative group flex gap-6 items-center !p-6">
            <div className={`p-5 rounded-3xl bg-${getColor(ach.conditionType)}-500/10 text-${getColor(ach.conditionType)}-500`}>
              {getIcon(ach.icon)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{ach.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-1">{ach.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Target size={14} className="text-slate-400" />
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider">
                  {ach.conditionType} {ach.conditionValue}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleOpenModal(ach)}
                className="p-2 text-primary-500 opacity-0 group-hover:opacity-100 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => deleteAchievement(ach._id)}
                className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-2xl font-bold">New Achievement Badge</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Badge Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="input-field" 
                    placeholder="e.g., Coding Ninja"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="input-field h-20 resize-none" 
                    placeholder="How do users earn this?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Icon</label>
                    <select 
                      value={formData.icon}
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      className="input-field"
                    >
                      <option value="Trophy">🏆 Trophy</option>
                      <option value="Star">⭐ Star</option>
                      <option value="Zap">⚡ Zap</option>
                      <option value="Target">🎯 Target</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Type</label>
                    <select 
                      value={formData.conditionType}
                      onChange={e => setFormData({...formData, conditionType: e.target.value})}
                      className="input-field"
                    >
                      <option value="level">Reach Level</option>
                      <option value="xp">Total XP</option>
                      <option value="score">Game Score</option>
                      <option value="gamesPlayed">Games Played</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Condition Value</label>
                  <input 
                    type="number"
                    required
                    value={formData.conditionValue}
                    onChange={e => setFormData({...formData, conditionValue: parseInt(e.target.value)})}
                    className="input-field" 
                  />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 font-bold">Cancel</button>
                  <button type="submit" className="btn-primary !px-10">
                    {editingAchievement ? 'Save Changes' : 'Create Badge'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAchievements;
