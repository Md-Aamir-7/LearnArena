import mongoose from 'mongoose';

const pythonQuestionSchema = new mongoose.Schema({
  topic: { 
    type: String, 
    required: true, 
    enum: ['variables', 'data_types', 'operators', 'lists', 'conditions', 'loops', 'functions', 'debugging'] 
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['Easy', 'Medium', 'Hard'] 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['output', 'fill-in', 'debug'] 
  },
  code: { type: String, required: true },
  question: { type: String, required: true },
  options: [String], // Used for output/choice
  answer: { type: String, required: true },
  explanation: String,
  xpReward: { type: Number, default: 10 }
}, { timestamps: true });

export default mongoose.model('PythonQuestion', pythonQuestionSchema);
