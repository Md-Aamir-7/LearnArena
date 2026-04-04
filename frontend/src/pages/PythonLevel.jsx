import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Terminal, CheckCircle2, XCircle, 
  Zap, Trophy, ChevronRight, BrainCircuit, Code, 
  HelpCircle, Timer, Star, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';

const PythonLevel = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  
  const [missionState, setMissionState] = useState('briefing'); // briefing, active, result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('Easy');

  const TOPIC_MAP = {
    1: 'variables', 2: 'data_types', 3: 'operators',
    4: 'lists', 5: 'conditions', 6: 'loops', 7: 'functions'
  };

  useEffect(() => {
    fetchMissionData();
  }, [levelId]);

  const fetchMissionData = async () => {
    setLoading(true);
    try {
      const topic = TOPIC_MAP[levelId] || 'variables';
      const res = await api.get(`/gamification/python/mission/${topic}`);
      setQuestions(res.data);
      // Get difficulty from first question (they share same difficulty in a mission)
      if (res.data.length > 0) setDifficulty(res.data[0].difficulty);
    } catch (err) {
      toast.error('Failed to load mission data');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSubmit = async () => {
    if (showFeedback) return;

    const answer = currentQ.type === 'fill-in' ? userInput.trim() : selectedOption;
    const correct = answer?.toLowerCase() === currentQ.answer.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);

    let xpChange = 0;
    if (correct) {
      xpChange = currentQ.xpReward;
      setScore(prev => prev + 1);
    } else if (difficulty === 'Hard') {
      xpChange = -5; // Penalty for Hard mode
      toast.warn('Hard Mode: -5 XP for incorrect logic!', { position: "top-center", autoClose: 1000 });
    }

    setEarnedXp(prev => Math.max(0, prev + xpChange));

    try {
      await api.post('/gamification/python/submit', {
        questionId: currentQ._id,
        isCorrect: correct,
        xpAdjustment: xpChange // Send adjustment to backend
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setUserInput('');
      setSelectedAnswer(null);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishMission();
      }
    }, 3000); // Increased time to read correct answer
  };

  const finishMission = async () => {
    const totalQuestions = questions.length;
    const passingScore = Math.ceil(totalQuestions * 0.6);
    const success = score >= passingScore;
    
    if (success) {
      try {
        await api.post('/users/complete-python-level', { levelId: parseInt(levelId), earnedXp });
      } catch (err) { console.error(err); }
    }
    setMissionState('result');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">Initializing Mission...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-12">
          <button onClick={() => navigate('/games/python')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={20} /> <span className="font-black uppercase tracking-widest text-xs">Abort Mission</span>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20 text-xs font-black uppercase">
              <BrainCircuit size={16} /> {difficulty} MODE
            </div>
            <div className="glass-card !py-2 !px-4 flex items-center gap-2">
              <Star className="text-amber-400" size={16} fill="currentColor" />
              <span className="font-black text-amber-400">{earnedXp} XP</span>
            </div>
          </div>
        </header>

        {missionState === 'briefing' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-24 h-24 bg-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/20">
              <Terminal size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">MISSION: {TOPIC_MAP[levelId]}</h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 font-medium">
              {difficulty === 'Hard' ? 'WARNING: Elite difficulty active. XP will be deducted for every logic error.' : 'Objective: Complete challenges to master this module.'}
            </p>
            <button onClick={() => setMissionState('active')} className="btn-primary !px-12 !py-5 text-xl font-black uppercase tracking-widest">
              Begin Adventure
            </button>
          </motion.div>
        ) : missionState === 'active' ? (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/80 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-800/50 px-6 py-3 flex items-center justify-between border-b border-slate-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">system_output.py</span>
                </div>
                
                <div className="p-8 font-mono text-lg min-h-[300px] flex items-center bg-[#050816]">
                  <pre className="text-blue-400 whitespace-pre-wrap w-full">
                    {currentQ.code.split('______').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="text-emerald-400">{part}</span>
                        {i < arr.length - 1 && (
                          <span className="relative inline-block mx-2">
                            <input 
                              autoFocus
                              value={userInput}
                              onChange={e => setUserInput(e.target.value)}
                              disabled={showFeedback}
                              className={`bg-slate-800 border-b-2 outline-none px-2 min-w-[100px] transition-all
                                ${showFeedback && !isCorrect ? 'border-rose-500 text-rose-400 bg-rose-500/10' : 
                                  showFeedback && isCorrect ? 'border-emerald-500 text-emerald-400' : 'border-primary-500 text-white'}`}
                              placeholder={showFeedback && !isCorrect ? currentQ.answer : "???"}
                            />
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </pre>
                </div>
              </div>

              <div className="glass-card !p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <HelpCircle className="text-primary-400" /> {currentQ.question}
                </h3>
                
                {currentQ.type !== 'fill-in' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentQ.options.map(opt => {
                      const isCorrectAnswer = opt.toLowerCase() === currentQ.answer.toLowerCase();
                      const isUserSelection = selectedOption === opt;
                      
                      let btnStyle = "border-slate-800 hover:border-slate-700 text-slate-400";
                      if (showFeedback) {
                        if (isCorrectAnswer) btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-400 scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                        else if (isUserSelection) btnStyle = "border-rose-500 bg-rose-500/20 text-rose-400 opacity-60";
                        else btnStyle = "border-slate-800 opacity-30 scale-95";
                      } else if (isUserSelection) {
                        btnStyle = "border-primary-500 bg-primary-500/10 text-primary-400";
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => setSelectedAnswer(opt)}
                          disabled={showFeedback}
                          className={`p-5 rounded-2xl border-2 font-bold text-left transition-all duration-300 flex items-center justify-between ${btnStyle}`}
                        >
                          {opt}
                          {showFeedback && isCorrectAnswer && <CheckCircle2 size={20} />}
                          {showFeedback && isUserSelection && !isCorrect && <XCircle size={20} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button 
                  onClick={handleSubmit}
                  disabled={showFeedback || (currentQ.type === 'fill-in' ? !userInput : !selectedOption)}
                  className="btn-primary w-full py-5 text-xl font-black uppercase tracking-widest group"
                >
                  Verify Logic <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card !p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-xs text-slate-500 uppercase tracking-widest">Mission Progress</h4>
                  <span className="font-black text-xs text-primary-500">{currentIndex + 1} / {questions.length}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-8">
                  <motion.div animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className="h-full bg-primary-500" />
                </div>
                
                <div className="space-y-4">
                  {questions.map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs
                        ${i < currentIndex ? 'bg-emerald-500/20 text-emerald-500' : i === currentIndex ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-600'}
                      `}>{i + 1}</div>
                      <span className={`font-bold text-sm ${i > currentIndex ? 'text-slate-600' : 'text-slate-300'}`}>
                        {i < currentIndex ? 'Verified' : i === currentIndex ? 'In Progress' : 'Locked'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {showFeedback && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} 
                    className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-4
                      ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}
                    `}
                  >
                    {isCorrect ? <CheckCircle2 size={48} className="text-emerald-500" /> : <AlertTriangle size={48} className="text-rose-500" />}
                    <h4 className="text-2xl font-black uppercase tracking-tighter">{isCorrect ? 'Logic Verified!' : 'System Fault'}</h4>
                    <p className="text-sm font-medium leading-relaxed">
                      {isCorrect ? "Proceeding to next data point." : `Correct solution: ${currentQ.answer}`}
                    </p>
                    <div className="mt-2 text-xs font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/10 italic">
                      "{currentQ.explanation}"
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl mx-auto py-20 text-center">
            <div className="glass-card !p-12 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${score >= Math.ceil(questions.length * 0.6) ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <Trophy size={80} className={`mx-auto mb-8 ${score >= Math.ceil(questions.length * 0.6) ? 'text-amber-400' : 'text-slate-600'}`} />
              <h2 className="text-5xl font-black tracking-tighter mb-2">{score >= Math.ceil(questions.length * 0.6) ? 'MISSION SUCCESS!' : 'MISSION FAILED'}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest mb-12">Accuracy Rating: {Math.round((score/questions.length)*100)}%</p>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mission Rewards</p>
                  <p className="text-3xl font-black text-emerald-400">+{earnedXp} XP</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank Status</p>
                  <p className="text-3xl font-black text-primary-400">{score >= Math.ceil(questions.length * 0.6) ? '+1 Level' : '0'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => navigate('/games/python')} className="btn-secondary flex-1">Back to Map</button>
                {score >= Math.ceil(questions.length * 0.6) ? (
                  <button onClick={() => {
                    navigate(`/games/python/level/${parseInt(levelId)+1}`);
                    window.location.reload();
                  }} className="btn-primary flex-1">Next Mission</button>
                ) : (
                  <button onClick={() => window.location.reload()} className="btn-primary flex-1">Try Again</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PythonLevel;
