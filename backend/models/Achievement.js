import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String, // String identifier for Lucide icons or URL
    required: true
  },
  conditionType: {
    type: String,
    enum: ['level', 'xp', 'score', 'gamesPlayed'],
    required: true
  },
  conditionValue: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
