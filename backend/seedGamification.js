import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DailyChallenge from './models/DailyChallenge.js';
import Season from './models/Season.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gamified-edu';

const challenges = [
  { title: 'Quiz Whiz', description: 'Complete 2 Knowledge Quizzes', type: 'quiz', requirement: 2, rewardXp: 50 },
  { title: 'Math Master', description: 'Solve 10 Math problems', type: 'math', requirement: 10, rewardXp: 100 },
  { title: 'Logic Ninja', description: 'Complete 3 Logic Puzzles', type: 'puzzle', requirement: 3, rewardXp: 75 },
  { title: 'Python Pro', description: 'Finish 1 Python Adventure level', type: 'python', requirement: 1, rewardXp: 60 }
];

const season = {
  number: 1,
  name: 'Genesis Season',
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  rewards: [
    { rank: 1, badge: 'Season Champion 🏆', xpBonus: 1000 },
    { rank: 2, badge: 'Season Elite 🥈', xpBonus: 500 },
    { rank: 3, badge: 'Season Veteran 🥉', xpBonus: 250 }
  ]
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for gamification seeding...');

    await DailyChallenge.deleteMany({});
    await DailyChallenge.insertMany(challenges);
    console.log('Daily challenges seeded!');

    await Season.deleteMany({});
    await Season.create(season);
    console.log('Current season seeded!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
