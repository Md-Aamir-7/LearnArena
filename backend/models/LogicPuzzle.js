import mongoose from 'mongoose';

const logicPuzzleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pattern: { type: [String], required: true }, // Array of strings/symbols
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

export default mongoose.model('LogicPuzzle', logicPuzzleSchema);
