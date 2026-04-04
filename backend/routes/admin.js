import express from 'express';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Quiz from '../models/Quiz.js';
import Activity from '../models/Activity.js';
import Achievement from '../models/Achievement.js';
import PythonLevel from '../models/PythonLevel.js';
import MathProblem from '../models/MathProblem.js';
import LogicPuzzle from '../models/LogicPuzzle.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'moderator']));

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ updatedAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } });
    const totalGamesPlayed = await Activity.countDocuments({ type: { $in: ['Game', 'Quiz'] } });
    const totalAchievementsEarned = await Activity.countDocuments({ type: 'Achievement' });
    
    // Daily Activity for the last 7 days
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Activity.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      activityData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        active: count
      });
    }

    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeUsers,
      totalGames: totalGamesPlayed,
      totalAchievements: totalAchievementsEarned,
      weeklyActivity: activityData,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Full Activity Log with filtering/pagination
router.get('/activity', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, username } = req.query;
    const query = {};
    if (type) query.type = type;
    if (username) query.username = new RegExp(username, 'i');

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leaderboard Management
router.post('/leaderboard/reset', async (req, res) => {
  try {
    await User.updateMany({}, { xp: 0, level: 1, achievements: [] });
    await Activity.create({
      user: req.user.userId,
      username: 'System',
      type: 'LevelUp',
      action: 'Leaderboard was reset by administrator',
    });
    res.json({ message: 'Leaderboard reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { xp, level, role, isBanned } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { xp, level, role, isBanned }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Game Management
router.get('/games', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/games', async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/games/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/games/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/games/:id', async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quiz Management
router.get('/quizzes', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const quizzes = await Quiz.find(query);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/quizzes/categories', async (req, res) => {
  try {
    const categories = await Quiz.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Python Level Management
router.get('/python-levels', async (req, res) => {
  try {
    const levels = await PythonLevel.find().sort({ levelId: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/python-levels', async (req, res) => {
  try {
    const level = new PythonLevel(req.body);
    await level.save();
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/python-levels/:id', async (req, res) => {
  try {
    const level = await PythonLevel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/python-levels/:id', async (req, res) => {
  try {
    await PythonLevel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Math Problem Management
router.get('/math-problems', async (req, res) => {
  try {
    const problems = await MathProblem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/math-problems', async (req, res) => {
  try {
    const problem = new MathProblem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/math-problems/:id', async (req, res) => {
  try {
    const problem = await MathProblem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/math-problems/:id', async (req, res) => {
  try {
    await MathProblem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logic Puzzle Management
router.get('/logic-puzzles', async (req, res) => {
  try {
    const puzzles = await LogicPuzzle.find().sort({ createdAt: -1 });
    res.json(puzzles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logic-puzzles', async (req, res) => {
  try {
    const puzzle = new LogicPuzzle(req.body);
    await puzzle.save();
    res.status(201).json(puzzle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/logic-puzzles/:id', async (req, res) => {
  try {
    const puzzle = await LogicPuzzle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/logic-puzzles/:id', async (req, res) => {
  try {
    await LogicPuzzle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Puzzle deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Achievement Management
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/achievements', async (req, res) => {
  try {
    const achievement = new Achievement(req.body);
    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/achievements/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/achievements/:id', async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
