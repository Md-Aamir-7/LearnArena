import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Timer, Trophy, Lightbulb, RefreshCcw, 
  ChevronRight, Star, Zap, CheckCircle2, XCircle,
  Hash, LayoutGrid, Layers, FastForward, Search, MousePointer2,
  PartyPopper
} from 'lucide-react';

const DIFFICULTIES = {
  Easy: { xp: 5, time: 60, bonus: 1, pairs: 6, gridCols: 'grid-cols-4' },
  Medium: { xp: 10, time: 90, bonus: 2, pairs: 8, gridCols: 'grid-cols-4' },
  Hard: { xp: 20, time: 120, bonus: 5, pairs: 12, gridCols: 'grid-cols-6' }
};

const GAME_TYPES = [
  { id: 'Memory', name: 'Memory Match', icon: Layers, color: 'text-rose-500', desc: 'Find all matching emoji pairs.' },
  { id: 'Pattern', name: 'Number Pattern', icon: Hash, color: 'text-blue-500', desc: 'Identify the next number in sequence.' },
  { id: 'Sequence', name: 'Sequence', icon: FastForward, color: 'text-purple-500', desc: 'Find the missing letter.' },
  { id: 'OddOneOut', name: 'Odd One Out', icon: Search, color: 'text-amber-500', desc: 'Find the element that does not belong.' },
  { id: 'Grid', name: 'Grid Logic', icon: LayoutGrid, color: 'text-emerald-500', desc: 'Solve pattern-based grid puzzles.' },
  { id: 'Custom', name: 'Elite Puzzles', icon: Star, color: 'text-indigo-500', desc: 'Expert puzzles from the database.' }
];

const EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍉', '🍍', '🥭', '🍑', '🍋', '🥥', '🍔', '🍕', '🌮', '🍦', '🍩', '🍪', '🍫', '🍿'];

const LogicPuzzleGame = () => {
  const { user, updateUserData } = useAuth();
  
  const [gameState, setGameState] = useState('setup');
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentType, setCurrentType] = useState(GAME_TYPES[0]);
  const [score, setScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [dbPuzzles, setDbPuzzles] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [puzzle, setPuzzle] = useState(null);
  const [cards, setCards] = useState([]);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    fetchDbPuzzles();
  }, []);

  const fetchDbPuzzles = async () => {
    try {
      const res = await api.get('/admin/logic-puzzles');
      setDbPuzzles(res.data);
    } catch (err) { console.error(err); }
  };

  const generatePattern = useCallback(() => {
    const start = Math.floor(Math.random() * 10) + 1;
    const diff = Math.floor(Math.random() * 5) + 1;
    let sequence = [start];
    for (let i = 0; i < 4; i++) sequence.push(sequence[i] + diff);
    const answer = sequence.pop();
    const options = [answer, answer + 5, answer - 2, answer + 10];
    return { question: sequence.join(', ') + ', ?', answer, options: options.sort(() => Math.random() - 0.5), hint: `Add ${diff} each time.` };
  }, []);

  const generateSequence = useCallback(() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const startIdx = Math.floor(Math.random() * 10);
    let sequence = [];
    for (let i = 0; i < 5; i++) sequence.push(alphabet[(startIdx + i) % 26]);
    const answer = sequence.pop();
    const options = [answer, 'X', 'Y', 'Z'];
    return { question: sequence.join(', ') + ', ?', answer, options: options.sort(() => Math.random() - 0.5), hint: 'Alphabetical order.' };
  }, []);

  const generateOddOneOut = useCallback(() => {
    const sets = [{ base: ['Apple', 'Banana', 'Cherry'], odd: 'Carrot', hint: 'Fruits vs Veg.' }];
    const set = sets[0];
    return { question: 'Find the odd one out:', answer: set.odd, options: [...set.base, set.odd].sort(() => Math.random() - 0.5), hint: set.hint };
  }, []);

  const generateGrid = useCallback(() => {
    return { question: "Grid Pattern: 2, 4, 6, ?", answer: 8, options: [8, 10, 12, 6], hint: "Multiples of 2." };
  }, []);

  const nextPuzzle = useCallback(() => {
    let newPuzzle;
    if (currentType.id === 'Custom' && dbPuzzles.length > 0) {
      const p = dbPuzzles[Math.floor(Math.random() * dbPuzzles.length)];
      newPuzzle = { question: p.title + ": " + p.pattern.join(', ') + ', ?', answer: p.correctAnswer, options: p.options, hint: p.description };
    } else {
      switch(currentType.id) {
        case 'Pattern': newPuzzle = generatePattern(); break;
        case 'Sequence': newPuzzle = generateSequence(); break;
        case 'OddOneOut': newPuzzle = generateOddOneOut(); break;
        case 'Grid': newPuzzle = generateGrid(); break;
        default: newPuzzle = generatePattern();
      }
    }
    setPuzzle(newPuzzle);
    setFeedback(null);
  }, [currentType, dbPuzzles, generatePattern, generateSequence, generateOddOneOut, generateGrid]);

  const initMemoryGame = useCallback(() => {
    const numPairs = DIFFICULTIES[difficulty].pairs;
    const selectedEmojis = EMOJIS.sort(() => Math.random() - 0.5).slice(0, numPairs);
    const cardData = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, value: emoji, flipped: true, matched: false }));
    setCards(cardData);
    setDisabled(true);
    setMoves(0);
    setMatches(0);
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsFinishing(false);
    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, flipped: false })));
      setDisabled(false);
    }, 2000);
  }, [difficulty]);

  const startGame = () => {
    setScore(0); setTotalXp(0); setStreak(0);
    setTimeLeft(DIFFICULTIES[difficulty].time);
    setGameState('playing');
    if (currentType.id === 'Memory') initMemoryGame();
    else nextPuzzle();
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isFinishing) {
      timer = setInterval(() => setTimeLeft(prev => prev <= 1 ? 0 : prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('result');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isFinishing]);

  const handleAnswer = (selected) => {
    if (feedback) return;
    if (String(selected) === String(puzzle.answer)) {
      const xpGain = DIFFICULTIES[difficulty].xp + streak;
      setScore(prev => prev + 100);
      setTotalXp(prev => prev + xpGain);
      setStreak(prev => prev + 1);
      setFeedback({ correct: true, xp: xpGain });
      setTimeout(nextPuzzle, 1000);
    } else {
      setStreak(0);
      setFeedback({ correct: false });
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleCardClick = (card) => {
    if (disabled || card.flipped || card.matched || (choiceOne && choiceOne.id === card.id)) return;
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, flipped: true } : c));
    if (!choiceOne) setChoiceOne(card);
    else setChoiceTwo(card);
  };

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      setMoves(prev => prev + 1);
      if (choiceOne.value === choiceTwo.value) {
        setCards(prev => prev.map(c => c.value === choiceOne.value ? { ...c, matched: true } : c));
        setMatches(m => m + 1);
        setScore(s => s + 200);
        setChoiceOne(null); setChoiceTwo(null); setDisabled(false);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === choiceOne.id || c.id === choiceTwo.id) ? { ...c, flipped: false } : c));
          setChoiceOne(null); setChoiceTwo(null); setDisabled(false);
        }, 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  useEffect(() => {
    if (currentType.id === 'Memory' && matches > 0 && matches === DIFFICULTIES[difficulty].pairs) {
      setIsFinishing(true);
      setTotalXp(prev => prev + 50);
      
      // Wait for completion animation before result
      setTimeout(() => {
        setGameState('result');
      }, 2500);
    }
  }, [matches, currentType.id, difficulty]);

  const saveResults = async () => {
    try {
      const res = await api.post('/users/update-xp', { 
        earnedXp: totalXp,
        gameType: 'Logic Puzzles',
        gameMode: `${currentType.name} (${difficulty})`
      });
      updateUserData(res.data.user || res.data);
      setGameState('setup');
    } catch (error) { console.error(error); }
  };

  if (gameState === 'setup') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-6xl font-black mb-16 text-center text-gradient uppercase tracking-tighter">Brain Blaster</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {GAME_TYPES.map(type => (
              <button key={type.id} onClick={() => setCurrentType(type)} className={`p-6 rounded-3xl border-2 text-left transition-all ${currentType.id === type.id ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
                <type.icon className={`mb-4 ${type.color}`} size={32} />
                <h4 className="font-bold">{type.name}</h4>
                <p className="text-xs text-slate-500">{type.desc}</p>
              </button>
            ))}
          </div>
          <div className="space-y-6">
            <div className="glass-card !p-4 space-y-2">
              {Object.keys(DIFFICULTIES).map(d => (
                <button key={d} onClick={() => setDifficulty(d)} className={`w-full p-4 rounded-2xl text-left font-bold ${difficulty === d ? 'bg-primary-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{d}</button>
              ))}
            </div>
            <button onClick={startGame} className="btn-primary w-full py-6 text-xl font-black uppercase tracking-widest">Start Game</button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="glass-card !p-12">
          <Trophy size={64} className="mx-auto text-amber-500 mb-6" />
          <h2 className="text-4xl font-black mb-8 uppercase italic">Finished!</h2>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl"><span className="block text-[10px] font-black text-slate-400 uppercase">Score</span><span className="text-2xl font-bold">{score}</span></div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl"><span className="block text-[10px] font-black text-slate-400 uppercase">XP</span><span className="text-2xl font-bold text-emerald-500">+{totalXp}</span></div>
            {currentType.id === 'Memory' && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl col-span-2 mt-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase">Total Moves</span>
                <span className="text-2xl font-bold text-primary-500">{moves}</span>
              </div>
            )}
          </div>
          <button onClick={saveResults} className="btn-primary w-full py-4 uppercase font-black">Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="glass-card !py-2 !px-6 text-2xl font-black tabular-nums border-2 border-primary-500/20">{timeLeft}s</div>
          <div className="glass-card !py-2 !px-6 text-2xl font-black text-amber-500 border-2 border-amber-500/20">{score}</div>
          {currentType.id === 'Memory' && (
            <div className="glass-card !py-2 !px-6 text-2xl font-black text-rose-500 border-2 border-rose-500/20">{moves} MOVES</div>
          )}
        </div>
        <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{currentType.name} Mode</div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {isFinishing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-md rounded-[3rem]"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <PartyPopper size={120} className="text-amber-400 mb-6" />
              </motion.div>
              <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase underline decoration-primary-500 underline-offset-8">BOARD CLEARED!</h2>
              <p className="text-primary-400 font-bold mt-4 tracking-widest uppercase">Syncing mission data...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {currentType.id === 'Memory' ? (
          <div className={`grid gap-4 mx-auto ${DIFFICULTIES[difficulty].gridCols}`} style={{ maxWidth: '800px' }}>
            {cards.map(card => (
              <div key={card.id} onClick={() => handleCardClick(card)} className="h-32 cursor-pointer perspective-1000">
                <motion.div className="w-full h-full relative preserve-3d" animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }} transition={{ duration: 0.6 }}>
                  <div className="absolute inset-0 backface-hidden bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-2 border-slate-700 hover:border-primary-500 transition-colors">❓</div>
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex items-center justify-center text-5xl border-4 ${card.matched ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-primary-500 bg-white dark:bg-slate-900'}`}>{card.value}</div>
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div key={puzzle?.question} className="glass-card !p-12 text-center relative overflow-hidden min-h-[400px] flex flex-col justify-center border-none shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl">
                  {feedback.correct ? <><CheckCircle2 size={100} className="text-emerald-500 mb-4" /><p className="text-4xl font-black text-emerald-500">+{feedback.xp} XP</p></> : <><XCircle size={100} className="text-rose-500 mb-4" /><p className="text-4xl font-black text-rose-500">TRY AGAIN</p></>}
                </motion.div>
              )}
            </AnimatePresence>
            <h2 className="text-5xl font-black mb-12 tracking-tighter leading-tight text-slate-800 dark:text-white uppercase italic">{puzzle?.question}</h2>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto w-full">
              {puzzle?.options.map((opt, i) => (
                <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(opt)} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent hover:border-primary-500 text-3xl font-black shadow-inner transition-all">{opt}</motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LogicPuzzleGame;
