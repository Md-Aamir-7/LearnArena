import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ChevronRight,
  ChevronDown,
  BookOpen,
  Zap,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminPythonLevels = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    levelId: 1,
    title: '',
    concept: '',
    icon: '📦',
    lesson: '',
    example: '',
    challenge: {
      question: '',
      type: 'fill-in',
      answer: '',
      code_template: '',
      options: []
    },
    quiz: [
      { q: '', a: ['', '', '', ''], correct: 0 }
    ],
    xpReward: 25
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/admin/python-levels');
      setLevels(res.data);
    } catch (error) {
      toast.error('Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (level = null) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        ...level,
        challenge: { ...level.challenge },
        quiz: level.quiz.map(q => ({ ...q, a: [...q.a] }))
      });
    } else {
      setEditingLevel(null);
      setFormData({
        levelId: levels.length + 1,
        title: '',
        concept: '',
        icon: '📦',
        lesson: '',
        example: '',
        challenge: {
          question: '',
          type: 'fill-in',
          answer: '',
          code_template: '',
          options: []
        },
        quiz: [
          { q: '', a: ['', '', '', ''], correct: 0 }
        ],
        xpReward: 25
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLevel) {
        await api.put(`/admin/python-levels/${editingLevel._id}`, formData);
        toast.success('Level updated');
      } else {
        await api.post('/admin/python-levels', formData);
        toast.success('Level created');
      }
      setIsModalOpen(false);
      fetchLevels();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const deleteLevel = async (id) => {
    if (!window.confirm('Delete this level?')) return;
    try {
      await api.delete(`/admin/python-levels/${id}`);
      toast.success('Level removed');
      fetchLevels();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      quiz: [...formData.quiz, { q: '', a: ['', '', '', ''], correct: 0 }]
    });
  };

  const removeQuizQuestion = (index) => {
    const newQuiz = formData.quiz.filter((_, i) => i !== index);
    setFormData({ ...formData, quiz: newQuiz });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/games')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Python Adventure Editor</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage levels, lessons, and challenges.</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> New Level
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading levels...</div>
        ) : levels.map((level) => (
          <div key={level._id} className="glass-card flex items-center justify-between !p-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                {level.icon}
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  Level {level.levelId}: {level.title}
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {level.concept}
                  </span>
                </h3>
                <p className="text-sm text-slate-500 line-clamp-1">{level.lesson}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenModal(level)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-primary-500 transition-all">
                <Edit size={18} />
              </button>
              <button onClick={() => deleteLevel(level._id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Complex Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 my-8"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-2xl font-bold">{editingLevel ? 'Edit Level' : 'Create Level'}</h3>
                  <p className="text-sm text-slate-500">Configure content for Level {formData.levelId}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Level ID</label>
                    <input type="number" required value={formData.levelId} onChange={e => setFormData({...formData, levelId: parseInt(e.target.value)})} className="input-field" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" placeholder="e.g., Variables" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Concept</label>
                    <input required value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} className="input-field" placeholder="e.g., Storing data" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Icon (Emoji)</label>
                    <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="input-field text-center text-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">XP Reward</label>
                    <input type="number" value={formData.xpReward} onChange={e => setFormData({...formData, xpReward: parseInt(e.target.value)})} className="input-field" />
                  </div>
                </div>

                {/* Lesson & Example */}
                <div className="space-y-6 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-rose-500 mb-2">
                    <BookOpen size={18} />
                    <h4 className="font-bold uppercase tracking-wider text-sm">Educational Content</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Mini Lesson (Markdown/Text)</label>
                    <textarea required value={formData.lesson} onChange={e => setFormData({...formData, lesson: e.target.value})} className="input-field h-32 resize-none" placeholder="Explain the concept clearly..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Code Example</label>
                    <textarea required value={formData.example} onChange={e => setFormData({...formData, example: e.target.value})} className="input-field h-24 font-mono text-sm resize-none" placeholder="name = 'Edu'..." />
                  </div>
                </div>

                {/* Challenge */}
                <div className="space-y-6 bg-amber-50/50 dark:bg-amber-900/5 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/20">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <Zap size={18} />
                    <h4 className="font-bold uppercase tracking-wider text-sm">Interactive Challenge</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Challenge Question</label>
                    <input required value={formData.challenge.question} onChange={e => setFormData({...formData, challenge: {...formData.challenge, question: e.target.value}})} className="input-field" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase">Type</label>
                      <select value={formData.challenge.type} onChange={e => setFormData({...formData, challenge: {...formData.challenge, type: e.target.value}})} className="input-field">
                        <option value="fill-in">Fill-in (____)</option>
                        <option value="input">Direct Input</option>
                        <option value="choice">Multiple Choice</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase">Correct Answer</label>
                      <input required value={formData.challenge.answer} onChange={e => setFormData({...formData, challenge: {...formData.challenge, answer: e.target.value}})} className="input-field font-mono" />
                    </div>
                  </div>
                  {formData.challenge.type === 'fill-in' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase">Code Template (Use ____ for blank)</label>
                      <input value={formData.challenge.code_template} onChange={e => setFormData({...formData, challenge: {...formData.challenge, code_template: e.target.value}})} className="input-field font-mono" placeholder="print(____)" />
                    </div>
                  )}
                </div>

                {/* Quiz Questions */}
                <div className="space-y-6 bg-primary-50/50 dark:bg-primary-900/5 p-6 rounded-3xl border border-primary-100 dark:border-primary-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary-500">
                      <HelpCircle size={18} />
                      <h4 className="font-bold uppercase tracking-wider text-sm">Mini Quiz ({formData.quiz.length})</h4>
                    </div>
                    <button type="button" onClick={addQuizQuestion} className="text-xs font-bold text-primary-500 flex items-center gap-1 hover:underline">
                      <Plus size={14} /> Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    {formData.quiz.map((q, idx) => (
                      <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 relative">
                        <button type="button" onClick={() => removeQuizQuestion(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500">✕</button>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase">Question {idx + 1}</label>
                          <input required value={q.q} onChange={e => {
                            const newQuiz = [...formData.quiz];
                            newQuiz[idx].q = e.target.value;
                            setFormData({...formData, quiz: newQuiz});
                          }} className="input-field" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.a.map((opt, oIdx) => (
                            <div key={oIdx} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Option {oIdx + 1}</label>
                                <input type="radio" name={`correct-${idx}`} checked={q.correct === oIdx} onChange={() => {
                                  const newQuiz = [...formData.quiz];
                                  newQuiz[idx].correct = oIdx;
                                  setFormData({...formData, quiz: newQuiz});
                                }} />
                              </div>
                              <input required value={opt} onChange={e => {
                                const newQuiz = [...formData.quiz];
                                newQuiz[idx].a[oIdx] = e.target.value;
                                setFormData({...formData, quiz: newQuiz});
                              }} className={`input-field !py-2 ${q.correct === oIdx ? 'ring-2 ring-emerald-500' : ''}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold">Cancel</button>
                  <button type="submit" className="btn-primary !px-12">
                    <Save size={20} className="mr-2 inline" />
                    Save Level Data
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

export default AdminPythonLevels;
