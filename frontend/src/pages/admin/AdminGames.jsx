import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Plus, 
  Gamepad2, 
  Settings2, 
  Power,
  Zap,
  Puzzle,
  Calculator,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const AdminGames = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Quiz',
    category: '',
    description: '',
    difficulty: 'Easy',
    icon: 'Gamepad2',
    xpReward: 10,
    path: '',
    color: 'primary'
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await api.get('/admin/games');
      setGames(res.data);
    } catch (error) {
      toast.error('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (game = null) => {
    if (game) {
      setEditGame(game);
      setFormData({
        name: game.name,
        type: game.type,
        category: game.category,
        description: game.description,
        difficulty: game.difficulty,
        icon: game.icon,
        xpReward: game.xpReward,
        path: game.path,
        color: game.color
      });
    } else {
      setEditGame(null);
      setFormData({
        name: '',
        type: 'Quiz',
        category: '',
        description: '',
        difficulty: 'Easy',
        icon: 'Gamepad2',
        xpReward: 10,
        path: '',
        color: 'primary'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGame) {
        await api.put(`/admin/games/${editingGame._id}`, formData);
        toast.success('Game updated successfully');
      } else {
        await api.post('/admin/games', formData);
        toast.success('New game added successfully');
      }
      setIsModalOpen(false);
      fetchGames();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const toggleGameStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/games/${id}`, { isEnabled: !currentStatus });
      toast.success(`Game ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchGames();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteGame = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    try {
      await api.delete(`/admin/games/${id}`);
      toast.success('Game deleted');
      fetchGames();
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Quiz': return <Zap className="text-amber-500" />;
      case 'Puzzle': return <Puzzle className="text-emerald-500" />;
      case 'Math': return <Calculator className="text-indigo-500" />;
      case 'Learning': return <BookOpen className="text-rose-500" />;
      default: return <Gamepad2 className="text-primary-500" />;
    }
  };

  const filteredGames = games.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) && 
    (filter === 'All' || g.type === filter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Game Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Control dashboard games and content.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Game
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Quiz">Quiz</option>
            <option value="Puzzle">Puzzle</option>
            <option value="Math">Math</option>
            <option value="Learning">Learning</option>
          </select>
        </div>
      </div>

      {/* Games Table/Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500">Loading games...</div>
        ) : filteredGames.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-500">No games found.</div>
        ) : filteredGames.map((game) => (
          <div key={game._id} className={`glass-card group flex flex-col sm:flex-row gap-6 !p-6 ${!game.isEnabled ? 'opacity-60' : ''}`}>
            <div className={`w-24 h-24 rounded-3xl bg-${game.color}-500/10 flex items-center justify-center flex-shrink-0`}>
              {getIcon(game.type)}
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-xl font-bold">{game.name}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenModal(game)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all"
                      title="Edit Settings"
                    >
                      <Settings2 size={18} />
                    </button>
                    <button 
                      onClick={() => toggleGameStatus(game._id, game.isEnabled)}
                      className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all ${game.isEnabled ? 'text-rose-500' : 'text-emerald-500'}`}
                      title={game.isEnabled ? 'Disable' : 'Enable'}
                    >
                      <Power size={18} />
                    </button>
                    <button 
                      onClick={() => deleteGame(game._id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{game.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`badge ${
                  game.difficulty === 'Easy' ? 'badge-success' : 
                  game.difficulty === 'Medium' ? 'badge-warning' : 
                  game.difficulty === 'Hard' ? 'badge-danger' : 'bg-primary-100 text-primary-700'
                }`}>
                  {game.difficulty}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-bold text-slate-500">
                  {game.xpReward} XP
                </span>
                <div className="flex-1"></div>
                <button 
                  onClick={() => {
                    const type = game.type;
                    const name = game.name.toLowerCase();
                    
                    if (type === 'Quiz') navigate('/admin/quizzes');
                    else if (type === 'Math') navigate('/admin/math-problems');
                    else if (type === 'Puzzle') navigate('/admin/logic-puzzles');
                    else if (name.includes('python')) navigate('/admin/python-levels');
                    else navigate(`/admin/game-content/${game._id}`); // Generic Fallback
                  }}
                  className="flex items-center gap-2 text-primary-500 font-bold text-sm hover:underline"
                >
                  <Edit size={14} /> Manage Content
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-2xl font-bold">{editingGame ? 'Edit Game' : 'Add New Game'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Game Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="input-field" 
                    placeholder="e.g., Python Adventure"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="input-field"
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Math">Math</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Category</label>
                  <input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="input-field" 
                    placeholder="e.g., Programming"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Difficulty</label>
                  <select 
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    className="input-field"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Progressive">Progressive</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="input-field h-24 resize-none" 
                    placeholder="Short description of the game..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">XP Reward</label>
                  <input 
                    type="number"
                    value={formData.xpReward}
                    onChange={e => setFormData({...formData, xpReward: parseInt(e.target.value)})}
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Route Path</label>
                  <input 
                    required
                    value={formData.path}
                    onChange={e => setFormData({...formData, path: e.target.value})}
                    className="input-field" 
                    placeholder="e.g., /games/python"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Theme Color</label>
                  <select 
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className="input-field"
                  >
                    <option value="primary">Blue (Default)</option>
                    <option value="emerald">Green</option>
                    <option value="amber">Yellow</option>
                    <option value="rose">Pink/Red</option>
                  </select>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 font-bold">Cancel</button>
                  <button type="submit" className="btn-primary">
                    {editingGame ? 'Save Changes' : 'Create Game'}
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

export default AdminGames;
