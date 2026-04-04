import mongoose from 'mongoose';

const mathProblemSchema = new mongoose.Schema({
  equation: { type: String, required: true },
  answer: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' }
}, { timestamps: true });

export default mongoose.model('MathProblem', mathProblemSchema);
