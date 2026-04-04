import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rewards: [{
    rank: Number,
    badge: String,
    xpBonus: Number
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Season', seasonSchema);
