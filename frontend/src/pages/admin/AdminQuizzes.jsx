import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, 
  Trash2, 
  Edit, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    category: 'Science',
    difficulty: 'Easy'
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/admin/quizzes');
      setQuizzes(res.data);
    } catch (error) {
      console.error('Failed to fetch quizzes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/quizzes', newQuiz);
      setShowAddModal(false);
      setNewQuiz({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        category: 'Science',
        difficulty: 'Easy'
      });
      fetchQuizzes();
    } catch (error) {
      // Handled by interceptor
    }
  };

  const deleteQuiz = async (id) => {
    if (window.confirm('Delete this question?')) {
      try {
        await api.delete(`/admin/quizzes/${id}`);
        fetchQuizzes();
      } catch (error) {
        // Handled by interceptor
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage questions for the Quiz module.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-500">No quiz questions found.</div>
        ) : quizzes.map((quiz) => (
          <div key={quiz._id} className="glass-card group">
            <div className="flex items-start justify-between mb-4">
              <span className={`badge ${
                quiz.difficulty === 'Easy' ? 'badge-success' : 
                quiz.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
              }`}>
                {quiz.difficulty}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => deleteQuiz(quiz._id)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 flex gap-3">
              <HelpCircle className="text-primary-500 shrink-0" size={24} />
              {quiz.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options.map((option, idx) => (
                <div 
                  key={idx}
                  className={`px-4 py-2.5 rounded-xl border text-sm flex items-center justify-between ${
                    option === quiz.correctAnswer 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 font-bold' 
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  {option}
                  {option === quiz.correctAnswer && <CheckCircle2 size={14} />}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Category: {quiz.category}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">New Quiz Question</h3>
            <form onSubmit={handleAddQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Question</label>
                <textarea 
                  required
                  className="input-field min-h-[100px]"
                  placeholder="Enter the question..."
                  value={newQuiz.question}
                  onChange={e => setNewQuiz({...newQuiz, question: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {newQuiz.options.map((opt, idx) => (
                  <div key={idx}>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Option {idx + 1}</label>
                    <input 
                      required
                      type="text"
                      className="input-field !py-2"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...newQuiz.options];
                        newOpts[idx] = e.target.value;
                        setNewQuiz({...newQuiz, options: newOpts});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Correct Answer</label>
                  <select 
                    required
                    className="input-field !py-2"
                    value={newQuiz.correctAnswer}
                    onChange={e => setNewQuiz({...newQuiz, correctAnswer: e.target.value})}
                  >
                    <option value="">Select correct option</option>
                    {newQuiz.options.filter(o => o.trim() !== '').map((o, idx) => (
                      <option key={idx} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <input 
                    required
                    type="text"
                    className="input-field !py-2"
                    value={newQuiz.category}
                    onChange={e => setNewQuiz({...newQuiz, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  Create Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
