import express from 'express';
import User from '../models/User.js';
import DailyChallenge from '../models/DailyChallenge.js';
import Season from '../models/Season.js';
import PythonQuestion from '../models/PythonQuestion.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get User Skill Tree
router.get('/skill-tree', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('skillTreeProgress');
    
    // Static Skill Tree Structure
    const skillTree = {
      programming: [
        { id: 'prog_1', label: 'Variables', type: 'learning', path: '/games/python/level/1', topic: 'variables' },
        { id: 'prog_2', label: 'Data Types', type: 'learning', parent: 'prog_1', path: '/games/python/level/2', topic: 'data_types' },
        { id: 'prog_3', label: 'Loops Master', type: 'learning', parent: 'prog_2', path: '/games/python/level/6', topic: 'loops' }
      ],
      logic: [
        { id: 'logic_1', label: 'Pattern Finder', type: 'puzzle', path: '/games/logic' },
        { id: 'logic_2', label: 'Sequence King', type: 'puzzle', parent: 'logic_1' },
        { id: 'logic_3', label: 'Elite Puzzles', type: 'puzzle', parent: 'logic_2' }
      ],
      math: [
        { id: 'math_1', label: 'Arithmetic', type: 'math', path: '/games/math' },
        { id: 'math_2', label: 'Fast Thinking', type: 'math', parent: 'math_1' }
      ]
    };

    res.json({ progress: user.skillTreeProgress, tree: skillTree });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get User Daily Challenges
router.get('/daily-challenges', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('dailyChallenges.currentChallenges.challengeId');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastRefresh = user.updatedAt;
    lastRefresh.setHours(0, 0, 0, 0);

    if (user.dailyChallenges.currentChallenges.length === 0 || lastRefresh < today) {
      const randomChallenges = await DailyChallenge.aggregate([{ $sample: { size: 3 } }]);
      user.dailyChallenges.currentChallenges = randomChallenges.map(c => ({
        challengeId: c._id,
        progress: 0,
        isCompleted: false,
        isClaimed: false
      }));
      await user.save();
      const updatedUser = await User.findById(req.user.userId).populate('dailyChallenges.currentChallenges.challengeId');
      return res.json(updatedUser.dailyChallenges);
    }

    res.json(user.dailyChallenges);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Claim Daily Challenge Reward
router.post('/claim-daily/:challengeId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const challengeIdx = user.dailyChallenges.currentChallenges.findIndex(
      c => c._id.toString() === req.params.challengeId
    );

    if (challengeIdx === -1) return res.status(404).json({ message: 'Challenge not found' });
    
    const subChallenge = user.dailyChallenges.currentChallenges[challengeIdx];
    if (subChallenge.isClaimed) return res.status(400).json({ message: 'Already claimed' });
    if (!subChallenge.isCompleted) return res.status(400).json({ message: 'Challenge not completed' });

    const challengeData = await DailyChallenge.findById(subChallenge.challengeId);
    
    user.xp += challengeData.rewardXp;
    subChallenge.isClaimed = true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!user.dailyChallenges.lastCompletedDate || user.dailyChallenges.lastCompletedDate < today) {
      user.dailyChallenges.streak += 1;
      user.dailyChallenges.lastCompletedDate = today;
    }

    await user.save();
    res.json({ message: 'Reward claimed', xp: challengeData.rewardXp, streak: user.dailyChallenges.streak });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Python Question Engine: Fetch Mission Questions
router.get('/python/mission/:topic', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { topic } = req.params;
    
    const performance = user.pythonProgress.topicPerformance[topic] || { accuracy: 0.5 };
    let difficulty = 'Easy';
    if (performance.accuracy > 0.8) difficulty = 'Hard';
    else if (performance.accuracy > 0.5) difficulty = 'Medium';

    const questions = await PythonQuestion.aggregate([
      { $match: { 
          topic, 
          difficulty, 
          _id: { $nin: user.pythonProgress.solvedQuestions || [] } 
      } },
      { $sample: { size: 5 } }
    ]);

    if (questions.length < 5) {
      const fallback = await PythonQuestion.aggregate([
        { $match: { topic } },
        { $sample: { size: 5 } }
      ]);
      return res.json(fallback);
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Python Question Engine: Submit Answer
router.post('/python/submit', authMiddleware, async (req, res) => {
  try {
    const { questionId, isCorrect } = req.body;
    const user = await User.findById(req.user.userId);
    const question = await PythonQuestion.findById(questionId);

    if (!question) return res.status(404).json({ message: 'Question not found' });

    const topic = question.topic;
    const perf = user.pythonProgress.topicPerformance[topic];

    perf.count += 1;
    const weight = 0.2;
    perf.accuracy = (perf.accuracy * (1 - weight)) + ((isCorrect ? 1 : 0) * weight);

    if (isCorrect) {
      user.xp += question.xpReward;
      user.seasonStats.seasonXp += question.xpReward;
      if (!user.pythonProgress.solvedQuestions.includes(questionId)) {
        user.pythonProgress.solvedQuestions.push(questionId);
      }
    }

    await user.save();
    res.json({ success: true, xp: isCorrect ? question.xpReward : 0, user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get Adaptive Difficulty
router.get('/adaptive-difficulty/:gameType', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { accuracy, tasksCompleted } = user.performanceMetrics;
    
    let difficulty = 'Easy';
    if (tasksCompleted > 5) {
      if (accuracy > 0.8) difficulty = 'Hard';
      else if (accuracy > 0.5) difficulty = 'Medium';
    }

    res.json({ difficulty });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
