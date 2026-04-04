import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Edit, Save, ArrowLeft, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminMathProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({ equation: '', answer: '', difficulty: 'Easy' });

  useEffect(() => { fetchProblems(); }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/admin/math-problems');
      setProblems(res.data);
    } catch (err) { toast.error('Failed to fetch'); } finally { setLoading(false); }
  };

  const handleOpenModal = (p = null) => {
    if (p) { setEditingProblem(p); setFormData({ ...p }); }
    else { setEditingProblem(null); setFormData({ equation: '', answer: '', difficulty: 'Easy' }); }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProblem) await api.put(`/admin/math-problems/${editingProblem._id}`, formData);
      else await api.post('/admin/math-problems', formData);
      toast.success('Saved'); setIsModalOpen(false); fetchProblems();
    } catch (err) { toast.error('Failed'); }
  };

  const deleteProblem = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/admin/math-problems/${id}`); toast.success('Deleted'); fetchProblems(); }
    catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/games')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ArrowLeft size={20} /></button>
          <h2 className="text-2xl font-bold">Math Problems Editor</h2>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={20} /> New Problem</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <p>Loading...</p> : problems.map(p => (
          <div key={p._id} className="glass-card flex items-center justify-between !p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Calculator size={20} /></div>
              <div>
                <p className="font-mono text-lg font-bold">{p.equation} = {p.answer}</p>
                <span className="text-xs uppercase font-black text-slate-400 tracking-widest">{p.difficulty}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpenModal(p)} className="text-primary-500 hover:bg-slate-100 p-2 rounded-lg"><Edit size={18} /></button>
              <button onClick={() => deleteProblem(p._id)} className="text-rose-500 hover:bg-slate-100 p-2 rounded-lg"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">{editingProblem ? 'Edit' : 'Add'} Problem</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="text-xs font-bold uppercase text-slate-400">Equation (e.g. 5 * 5)</label>
                <input required value={formData.equation} onChange={e => setFormData({...formData, equation: e.target.value})} className="input-field" /></div>
                <div><label className="text-xs font-bold uppercase text-slate-400">Answer</label>
                <input type="number" required value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="input-field" /></div>
                <div><label className="text-xs font-bold uppercase text-slate-400">Difficulty</label>
                <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="input-field">
                  <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                </select></div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Problem</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMathProblems;
