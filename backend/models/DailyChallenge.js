import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['quiz', 'puzzle', 'math', 'python'], 
    required: true 
  },
  requirement: { type: Number, required: true }, // e.g. 2 for "Complete 2 quizzes"
  rewardXp: { type: Number, default: 50 },
  icon: { type: String, default: 'Zap' }
}, { timestamps: true });

export default mongoose.model('DailyChallenge', dailyChallengeSchema);
