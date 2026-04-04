import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useAdaptiveDifficulty } from '../hooks/useAdaptiveDifficulty';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, CheckCircle2, XCircle, Timer, Trophy, BrainCircuit } from 'lucide-react';

const MathGame = () => {
  const { user, updateUserData } = useAuth();
  const { difficulty: adaptiveDifficulty, loading: diffLoading } = useAdaptiveDifficulty('Math');
  const [question, setQuestion] = useState({});
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [dbProblems, setDbProblems] = useState([]);
  const [startTime] = useState(Date.now());
  const [gameStats, setGameStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    if (!diffLoading) {
      fetchProblems();
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [diffLoading]);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/admin/math-problems');
      setDbProblems(res.data);
      generateQuestion(res.data);
    } catch (err) {
      generateQuestion([]);
    }
  };

  const generateQuestion = (availableDbProblems = dbProblems) => {
    // 50% chance to use DB problem if available
    if (availableDbProblems.length > 0 && Math.random() > 0.5) {
      const p = availableDbProblems[Math.floor(Math.random() * availableDbProblems.length)];
      setQuestion({ text: p.equation, answer: p.answer });
      const newOptions = [p.answer];
      while (newOptions.length < 4) {
        const wrong = p.answer + Math.floor(Math.random() * 10) - 5;
        if (!newOptions.includes(wrong)) newOptions.push(wrong);
      }
      setOptions(newOptions.sort(() => Math.random() - 0.5));
    } else {
      // Procedural fallback
      const maxRange = adaptiveDifficulty === 'Hard' ? 100 : adaptiveDifficulty === 'Medium' ? 50 : 20;
      const num1 = Math.floor(Math.random() * maxRange) + 1;
      const num2 = Math.floor(Math.random() * maxRange) + 1;
      const operators = adaptiveDifficulty === 'Easy' ? ['+', '-'] : ['+', '-', '*'];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      
      let answer;
      if (operator === '+') answer = num1 + num2;
      else if (operator === '-') answer = num1 - num2;
      else answer = num1 * num2;

      setQuestion({ text: `${num1} ${operator} ${num2}`, answer });
      const newOptions = [answer];
      while (newOptions.length < 4) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (!newOptions.includes(wrong)) newOptions.push(wrong);
      }
      setOptions(newOptions.sort(() => Math.random() - 0.5));
    }
  };

  const handleAnswer = async (selected) => {
    setGameStats(prev => ({ ...prev, total: prev.total + 1 }));
    if (selected === question.answer) {
      setGameStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setScore(score + 10);
      setFeedback({ correct: true });
      setTimeout(() => {
        setFeedback(null);
        generateQuestion();
      }, 500);
    } else {
      setFeedback({ correct: false });
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const saveScore = async () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    try {
      const res = await api.post('/users/update-xp', { 
        earnedXp: score,
        gameType: 'Math',
        gameMode: adaptiveDifficulty,
        timeSpent,
        totalTasks: gameStats.total,
        correctTasks: gameStats.correct
      });
      updateUserData(res.data.user || res.data);
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to save score', error);
    }
  };

  if (diffLoading) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">Calibrating difficulty...</div>;

  if (gameOver) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md mx-auto mt-20 glass-card text-center">
        <Trophy size={64} className="mx-auto text-amber-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-8 text-slate-500">You earned <span className="text-primary-500 font-bold">{score} XP</span></p>
        <button onClick={saveScore} className="btn-primary w-full py-4 text-lg">Back to Dashboard</button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="glass-card !py-2 !px-4 flex items-center gap-3 flex-1 justify-center">
            <Timer size={20} className={timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-primary-500'} />
            <span className={`text-xl font-bold tabular-nums ${timeLeft < 10 ? 'text-rose-500' : ''}`}>{timeLeft}s</span>
          </div>
          <div className="glass-card !py-2 !px-4 flex items-center gap-2 text-indigo-500 font-black text-xs uppercase flex-1 justify-center">
            <BrainCircuit size={16} /> {adaptiveDifficulty}
          </div>
        </div>
        <div className="flex items-center gap-3 glass-card !py-2 !px-4 border-2 border-amber-500/20 w-full sm:w-auto justify-center">
          <Trophy size={20} className="text-amber-500" />
          <span className="text-xl font-bold">{score} XP</span>
        </div>
      </div>

      <motion.div key={question.text} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card text-center mb-8 md:mb-10 min-h-[150px] md:min-h-[200px] flex items-center justify-center relative overflow-hidden">
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 0.2 }} exit={{ scale: 2, opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
              {feedback.correct ? <CheckCircle2 size={120} className="text-emerald-500" /> : <XCircle size={120} className="text-rose-500" />}
            </motion.div>
          )}
        </AnimatePresence>
        <h3 className="text-4xl md:text-6xl font-black text-slate-700 dark:text-slate-200">{question.text}</h3>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl mx-auto">
        {options.map((opt, idx) => (
          <motion.button key={idx} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(opt)} className="glass-card !p-6 md:!p-10 text-3xl md:text-4xl font-black hover:bg-primary-500 hover:text-white transition-all border-2 border-slate-100 dark:border-slate-800 hover:border-primary-400 shadow-lg">
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MathGame;
