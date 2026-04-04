import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [v => v.length >= 2, 'Quiz must have at least 2 options']
  },
  correctAnswer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
