import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Edit, Save, ArrowLeft, Puzzle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminLogicPuzzles = () => {
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', pattern: ['', '', ''], options: ['', '', '', ''], correctAnswer: '', difficulty: 'Medium' });

  useEffect(() => { fetchPuzzles(); }, []);

  const fetchPuzzles = async () => {
    try {
      const res = await api.get('/admin/logic-puzzles');
      setPuzzles(res.data);
    } catch (err) { toast.error('Failed to fetch'); } finally { setLoading(false); }
  };

  const handleOpenModal = (p = null) => {
    if (p) { setEditingPuzzle(p); setFormData({ ...p }); }
    else { setEditingPuzzle(null); setFormData({ title: '', description: '', pattern: ['', '', ''], options: ['', '', '', ''], correctAnswer: '', difficulty: 'Medium' }); }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPuzzle) await api.put(`/admin/logic-puzzles/${editingPuzzle._id}`, formData);
      else await api.post('/admin/logic-puzzles', formData);
      toast.success('Saved'); setIsModalOpen(false); fetchPuzzles();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/games')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <h2 className="text-2xl font-bold">Logic Puzzles Editor</h2>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={20} /> New Puzzle</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <p>Loading...</p> : puzzles.map(p => (
          <div key={p._id} className="glass-card flex items-center justify-between !p-6">
            <div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-1">{p.description}</p>
              <span className="text-xs uppercase font-black text-slate-400 tracking-widest">{p.difficulty}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpenModal(p)} className="text-primary-500 hover:bg-slate-100 p-2 rounded-lg"><Edit size={18} /></button>
              <button onClick={() => {/* delete logic */}} className="text-rose-500 hover:bg-slate-100 p-2 rounded-lg"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl my-8">
              <h3 className="text-2xl font-bold mb-6">{editingPuzzle ? 'Edit' : 'Add'} Puzzle</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold uppercase text-slate-400">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" /></div>
                  <div><label className="text-xs font-bold uppercase text-slate-400">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="input-field">
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select></div>
                </div>
                <div><label className="text-xs font-bold uppercase text-slate-400">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field h-20" /></div>
                
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Pattern Symbols (Array)</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.pattern.map((s, i) => (
                      <input key={i} value={s} onChange={e => {
                        const newP = [...formData.pattern]; newP[i] = e.target.value; setFormData({...formData, pattern: newP});
                      }} className="input-field text-center" placeholder={`Item ${i+1}`} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Answer Options</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {formData.options.map((s, i) => (
                      <input key={i} value={s} onChange={e => {
                        const newO = [...formData.options]; newO[i] = e.target.value; setFormData({...formData, options: newO});
                      }} className="input-field" placeholder={`Option ${i+1}`} />
                    ))}
                  </div>
                </div>

                <div><label className="text-xs font-bold uppercase text-slate-400">Correct Answer</label>
                <input required value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} className="input-field" /></div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Puzzle</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLogicPuzzles;
