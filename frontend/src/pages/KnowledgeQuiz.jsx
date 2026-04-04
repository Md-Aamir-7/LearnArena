import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useAdaptiveDifficulty } from '../hooks/useAdaptiveDifficulty';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Timer, Trophy, Lightbulb, 
  ChevronRight, Star, Zap, CheckCircle2, XCircle,
  Dna, Calculator, Globe, HelpCircle, FastForward, BrainCircuit
} from 'lucide-react';

const DIFFICULTIES = {
  Easy: { xp: 5, time: 15, bonus: 1 },
  Medium: { xp: 10, time: 12, bonus: 2 },
  Hard: { xp: 20, time: 10, bonus: 5 }
};

const CATEGORIES = [
  { id: 'Science', name: 'Science', icon: Dna, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'Mathematics', name: 'Mathematics', icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'General Knowledge', name: 'General Knowledge', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' }
];

const STATIC_QUESTIONS = {
  Science: [
    { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "NaCl"], correctAnswer: "H2O" },
    { question: "Which planet is known as the Red Planet?", options: ["Mars", "Jupiter", "Venus", "Saturn"], correctAnswer: "Mars" },
    { question: "What is the hardest natural substance on Earth?", options: ["Diamond", "Gold", "Iron", "Quartz"], correctAnswer: "Diamond" }
  ],
  Mathematics: [
    { question: "What is 15 * 8?", options: ["120", "110", "130", "140"], correctAnswer: "120" },
    { question: "What is the square root of 144?", options: ["12", "11", "13", "14"], correctAnswer: "12" },
    { question: "What is the value of Pi (to 2 decimal places)?", options: ["3.14", "3.16", "3.12", "3.18"], correctAnswer: "3.14" }
  ],
  "General Knowledge": [
    { question: "Who painted the Mona Lisa?", options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Claude Monet"], correctAnswer: "Leonardo da Vinci" },
    { question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], correctAnswer: "Paris" },
    { question: "Which is the largest ocean on Earth?", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], correctAnswer: "Pacific Ocean" }
  ]
};

const KnowledgeQuiz = () => {
  const { user, updateUserData } = useAuth();
  const { difficulty: adaptiveDifficulty, loading: diffLoading } = useAdaptiveDifficulty('Quiz');
  
  // Game State
  const [gameState, setGameState] = useState('setup'); // setup, playing, result
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [startTime, setStartTime] = useState(Date.now());
  const [gameStats, setGameStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    if (!diffLoading) {
      setDifficulty(adaptiveDifficulty);
    }
  }, [adaptiveDifficulty, diffLoading]);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setStartTime(Date.now());
    setGameStats({ total: 0, correct: 0 });
    
    try {
      const res = await api.get(`/quizzes?category=${currentCategory.id}&difficulty=${difficulty}`);
      let quizData = res.data;
      
      if (!quizData || quizData.length === 0) {
        quizData = STATIC_QUESTIONS[currentCategory.id] || [];
      }
      
      setQuestions(quizData.sort(() => Math.random() - 0.5).slice(0, 10));
      setCurrentIndex(0);
      setScore(0);
      setTotalXp(0);
      setStreak(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(DIFFICULTIES[difficulty].time);
      setGameState('playing');
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
      const quizData = STATIC_QUESTIONS[currentCategory.id] || [];
      setQuestions(quizData.sort(() => Math.random() - 0.5).slice(0, 10));
      setGameState('playing');
    } finally {
      setLoading(false);
    }
  }, [currentCategory, difficulty]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && selectedAnswer === null) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedAnswer === null && gameState === 'playing') {
      handleAnswer(null); // Time's up
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedAnswer]);

  const handleAnswer = (option) => {
    if (selectedAnswer !== null) return;
    
    setGameStats(prev => ({ ...prev, total: prev.total + 1 }));
    setSelectedAnswer(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setGameStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      const xpGain = DIFFICULTIES[difficulty].xp + streak;
      const speedBonus = Math.floor(timeLeft * 2);
      setScore(prev => prev + 100 + speedBonus + (streak * 10));
      setTotalXp(prev => prev + xpGain);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(DIFFICULTIES[difficulty].time);
      } else {
        setGameState('result');
      }
    }, 1500);
  };

  const saveResults = async () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    try {
      const res = await api.post('/users/update-xp', { 
        earnedXp: totalXp,
        gameType: 'Quiz',
        gameMode: difficulty,
        category: currentCategory.name,
        timeSpent,
        totalTasks: gameStats.total,
        correctTasks: gameStats.correct
      });
      updateUserData(res.data.user || res.data);
      setGameState('setup');
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  if (diffLoading) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">Preparing intelligence quest...</div>;

  if (gameState === 'setup') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-6xl font-black mb-4 tracking-tighter text-gradient">QUIZ MASTER</h1>
          <p className="text-slate-500 text-xl font-medium">Test your knowledge & earn rewards</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3"><BookOpen className="text-primary-500" /> Choose Category</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategory(cat)}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
                    currentCategory.id === cat.id ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-primary-200'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color}`}>
                    <cat.icon size={32} />
                  </div>
                  <h4 className="text-lg font-bold">{cat.name}</h4>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-3"><Zap className="text-amber-500" /> Difficulty</h3>
              <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                <BrainCircuit size={12} /> Adaptive
              </div>
            </div>
            <div className="glass-card !p-4 space-y-3">
              {Object.keys(DIFFICULTIES).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${
                    difficulty === d ? 'border-primary-500 bg-primary-500/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <span className="font-bold text-lg">{d}</span>
                  <div className="flex gap-1">
                    {[...Array(d === 'Easy' ? 1 : d === 'Medium' ? 2 : 3)].map((_, i) => <Star key={i} size={14} className="fill-amber-500 text-amber-500" />)}
                  </div>
                </button>
              ))}
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={fetchQuestions}
              disabled={loading}
              className="btn-primary w-full py-6 text-2xl font-black shadow-2xl shadow-primary-500/40 flex items-center justify-center gap-3"
            >
              {loading ? "LOADING..." : "START QUIZ"} <ChevronRight size={28} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card text-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-primary-500" />
          </div>
          <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy size={48} className="text-amber-500" />
          </div>
          <h2 className="text-5xl font-black mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 text-lg mb-10">You've mastered the {currentCategory.name} challenge.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 text-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Final Score</span>
              <span className="text-4xl font-black text-primary-500">{score}</span>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 text-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">XP Gained</span>
              <span className="text-4xl font-black text-emerald-500">+{totalXp}</span>
            </div>
          </div>

          <button onClick={saveResults} className="btn-primary w-full py-5 text-xl font-bold">Collect Rewards & Finish</button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* HUD */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="glass-card !py-3 !px-6 flex items-center gap-4">
            <Timer size={28} className={timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-primary-500'} />
            <span className={`text-3xl font-black tracking-tighter tabular-nums ${timeLeft < 5 ? 'text-rose-500' : ''}`}>{timeLeft}s</span>
          </div>
          {streak > 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg">
              <Zap size={20} fill="currentColor" /> {streak} STREAK
            </motion.div>
          )}
        </div>

        <div className="glass-card !py-3 !px-6 flex items-center gap-4 border-2 border-primary-500/20">
          <Trophy size={28} className="text-amber-500" />
          <span className="text-3xl font-black tracking-tighter text-primary-600">{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-xs font-black text-primary-500 uppercase tracking-widest">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }} 
            className="h-full bg-gradient-to-r from-primary-400 to-indigo-500 rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card min-h-[500px] flex flex-col p-12 relative overflow-hidden border-none shadow-2xl shadow-primary-500/5"
        >
          <div className="mb-8 flex justify-between items-center">
            <span className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest ${currentCategory.bg} ${currentCategory.color}`}>
              {currentCategory.name}
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <BrainCircuit size={14} className="text-indigo-500" /> {difficulty} Difficulty
            </span>
          </div>

          <h2 className="text-4xl font-black mb-12 text-slate-800 dark:text-slate-50 tracking-tight leading-tight">
            {currentQuestion?.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
            {currentQuestion?.options.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let statusClasses = "border-slate-100 dark:border-slate-800 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-900";
              
              if (selectedAnswer !== null) {
                if (isCorrectOption) statusClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else if (isSelected) statusClasses = "border-rose-500 bg-rose-500/10 text-rose-600";
                else statusClasses = "opacity-50 border-slate-100 dark:border-slate-800";
              }

              return (
                <motion.button
                  key={i}
                  whileHover={selectedAnswer === null ? { scale: 1.02, x: 5 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-10 rounded-3xl border-2 transition-all text-left flex items-center justify-between group shadow-lg ${statusClasses}`}
                >
                  <span className="text-2xl font-black">{option}</span>
                  {selectedAnswer !== null && (
                    isCorrectOption ? <CheckCircle2 className="text-emerald-500" size={28} /> : 
                    (isSelected ? <XCircle className="text-rose-500" size={28} /> : null)
                  )}
                </motion.button>
              );
            })}
          </div>

          {selectedAnswer === null && timeLeft === 0 && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
                  <Timer size={80} className="text-rose-500 mx-auto mb-4" />
                  <p className="text-3xl font-black text-rose-500">TIME'S UP!</p>
                </motion.div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeQuiz;
