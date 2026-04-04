import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Game', 'Quiz', 'Achievement', 'LevelUp'],
    required: true
  },
  details: {
    type: Object
  }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
