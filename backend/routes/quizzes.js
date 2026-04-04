import express from 'express';
import Quiz from '../models/Quiz.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get Quizzes by category and difficulty
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query);
    // Return randomized subset or all
    res.json(quizzes.sort(() => 0.5 - Math.random()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Quiz.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
