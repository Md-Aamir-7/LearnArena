import mongoose from 'mongoose';

const pythonLevelSchema = new mongoose.Schema({
  levelId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  concept: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📦'
  },
  lesson: {
    type: String,
    required: true
  },
  example: {
    type: String,
    required: true
  },
  challenge: {
    question: String,
    type: {
      type: String,
      enum: ['fill-in', 'choice', 'input'],
      default: 'fill-in'
    },
    answer: String,
    code_template: String,
    options: [String]
  },
  quiz: [{
    q: String,
    a: [String],
    correct: Number
  }],
  xpReward: {
    type: Number,
    default: 25
  }
}, { timestamps: true });

export default mongoose.model('PythonLevel', pythonLevelSchema);
