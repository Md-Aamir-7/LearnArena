import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Quiz', 'Puzzle', 'Math', 'Learning'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Progressive'],
    default: 'Easy'
  },
  icon: {
    type: String, // Lucide icon name
    default: 'Gamepad2'
  },
  xpReward: {
    type: Number,
    default: 10
  },
  path: {
    type: String,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  totalPlays: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: 'primary' // primary, emerald, amber, rose
  }
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);
