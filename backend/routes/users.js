import express from 'express';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import authMiddleware from '../middleware/auth.js';
import Game from '../models/Game.js';
const router = express.Router();

// Get all enabled games (public)
router.get('/games', authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ isEnabled: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get public stats for game dashboard
router.get('/public-stats', authMiddleware, async (req, res) => {
  try {
    const topUser = await User.findOne().sort({ level: -1, xp: -1 });
    const onlineCount = await User.countDocuments({ 
      updatedAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } 
    });
    
    // Fallback if no users yet
    const topScore = topUser ? (topUser.level * 1000 + topUser.xp) : 0;

    res.json({
      topScore,
      onlineCount: Math.max(onlineCount, 1) // At least the current user is online
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get Leaderboard (sorted by level, then xp)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ xp: -1, level: -1 })
      .limit(10);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update XP and Level after game completion
router.post('/update-xp', authMiddleware, async (req, res) => {
  try {
    const { earnedXp, xp, gameType, gameMode, category, timeSpent, totalTasks, correctTasks } = req.body;
    const actualXp = earnedXp || xp || 0;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.xp += actualXp;

    // Performance Metrics
    if (totalTasks) {
      const accuracy = correctTasks / totalTasks;
      user.performanceMetrics.tasksCompleted += totalTasks;
      // Weighted average for accuracy
      user.performanceMetrics.accuracy = (user.performanceMetrics.accuracy * 0.7) + (accuracy * 0.3);
      if (timeSpent) {
        const speed = timeSpent / totalTasks;
        user.performanceMetrics.avgSpeed = (user.performanceMetrics.avgSpeed * 0.7) + (speed * 0.3);
      }
      user.performanceMetrics.totalMistakes += (totalTasks - correctTasks);
    }

    // Daily Challenge Progress
    if (gameType) {
      const typeMap = { 'Quiz': 'quiz', 'Logic Puzzles': 'puzzle', 'Math': 'math', 'Python': 'python' };
      const challengeType = typeMap[gameType] || 'quiz';

      const userWithChallenges = await User.findById(req.user.userId).populate('dailyChallenges.currentChallenges.challengeId');
      
      if (user.dailyChallenges && user.dailyChallenges.currentChallenges) {
        user.dailyChallenges.currentChallenges.forEach((c, idx) => {
          const challengeData = userWithChallenges.dailyChallenges.currentChallenges[idx]?.challengeId;
          if (challengeData && !c.isCompleted && challengeData.type === challengeType) {
            c.progress += (gameType === 'Math' ? (correctTasks || 1) : 1);
            if (c.progress >= challengeData.requirement) {
              c.isCompleted = true;
            }
          }
        });
      }
    }

    // Log Activity
    if (gameType) {
      await Activity.create({
        user: user._id,
        username: user.username,
        type: gameType === 'Quiz' ? 'Quiz' : 'Game',
        action: `Completed ${gameType}${category ? ` (${category})` : ''}${gameMode ? ` - ${gameMode}` : ''}`,
        details: { xp: actualXp, gameMode, category }
      });
    }

    // Level progression logic (Level * 100 XP to level up)
    let nextLevelXp = user.level * 100;
    let leveledUp = false;
    const oldLevel = user.level;

    while (user.xp >= nextLevelXp) {
      user.level += 1;
      user.xp -= nextLevelXp;
      leveledUp = true;
      nextLevelXp = user.level * 100;
    }

    if (leveledUp) {
      await Activity.create({
        user: user._id,
        username: user.username,
        type: 'LevelUp',
        action: `Reached Level ${user.level}`,
        details: { from: oldLevel, to: user.level }
      });
    }

    // Achievements
    if (user.level >= 5 && !user.achievements.includes('Apprentice')) {
      user.achievements.push('Apprentice');
      await Activity.create({
        user: user._id,
        username: user.username,
        type: 'Achievement',
        action: 'Earned Apprentice Badge',
        details: { achievement: 'Apprentice' }
      });
    }
    if (user.level >= 10 && !user.achievements.includes('Master')) {
      user.achievements.push('Master');
      await Activity.create({
        user: user._id,
        username: user.username,
        type: 'Achievement',
        action: 'Earned Master Badge',
        details: { achievement: 'Master' }
      });
    }
    if (actualXp >= 50 && !user.achievements.includes('Fast Thinker')) {
      user.achievements.push('Fast Thinker');
      await Activity.create({
        user: user._id,
        username: user.username,
        type: 'Achievement',
        action: 'Earned Fast Thinker Badge',
        details: { achievement: 'Fast Thinker' }
      });
    }
    if (user.xp >= 500 && !user.achievements.includes('Quiz Master')) {
      user.achievements.push('Quiz Master');
      await Activity.create({
        user: user._id,
        username: user.username,
        type: 'Achievement',
        action: 'Earned Quiz Master Badge',
        details: { achievement: 'Quiz Master' }
      });
    }

    await user.save();

    res.json({ 
      id: user._id, 
      username: user.username, 
      level: user.level, 
      xp: user.xp, 
      role: user.role,
      achievements: user.achievements,
      leveledUp 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Complete Python Adventure Level
router.post('/complete-python-level', authMiddleware, async (req, res) => {
  try {
    const { levelId, earnedXp } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize pythonProgress if it doesn't exist (for older users)
    if (!user.pythonProgress) {
      user.pythonProgress = { completedLevels: [], lastActiveLevel: 0, solvedQuestions: [], topicPerformance: {
        variables: { accuracy: 0, count: 0 },
        data_types: { accuracy: 0, count: 0 },
        operators: { accuracy: 0, count: 0 },
        lists: { accuracy: 0, count: 0 },
        conditions: { accuracy: 0, count: 0 },
        loops: { accuracy: 0, count: 0 },
        functions: { accuracy: 0, count: 0 },
        debugging: { accuracy: 0, count: 0 }
      }};
    }

    // Add to completed levels if not already there
    if (!user.pythonProgress.completedLevels.includes(levelId)) {
      user.pythonProgress.completedLevels.push(levelId);
    }
    user.pythonProgress.lastActiveLevel = levelId;

    // Update XP
    user.xp += earnedXp;

    // Log Activity
    await Activity.create({
      user: user._id,
      username: user.username,
      type: 'Game',
      action: `Completed Python Adventure Level ${levelId}`,
      details: { xp: earnedXp, levelId }
    });

    // Level progression logic
    let nextLevelXp = user.level * 100;
    let leveledUp = false;
    const oldLevel = user.level;

    while (user.xp >= nextLevelXp) {
      user.level += 1;
      user.xp -= nextLevelXp;
      leveledUp = true;
      nextLevelXp = user.level * 100;
    }

    if (leveledUp) {
      await Activity.create({
        user: user._id,
        username: user.username,
        type: 'LevelUp',
        action: `Reached Level ${user.level}`,
        details: { from: oldLevel, to: user.level }
      });
    }

    // Python-specific Achievements
    const pythonBadges = [
      { id: 1, name: 'Python Beginner 🐍' },
      { id: 5, name: 'Loop Master 🔁' },
      { id: 6, name: 'Function Hero ⚙️' }
    ];

    for (const badge of pythonBadges) {
      if (levelId === badge.id && !user.achievements.includes(badge.name)) {
        user.achievements.push(badge.name);
        await Activity.create({
          user: user._id,
          username: user.username,
          type: 'Achievement',
          action: `Earned ${badge.name}`,
          details: { achievement: badge.name }
        });
      }
    }

    await user.save();

    res.json({
      success: true,
      user: {
        level: user.level,
        xp: user.xp,
        achievements: user.achievements,
        pythonProgress: user.pythonProgress
      },
      leveledUp
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
