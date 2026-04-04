import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  rank: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String
  }],
  pythonProgress: {
    completedLevels: {
      type: [Number],
      default: []
    },
    lastActiveLevel: {
      type: Number,
      default: 0
    },
    solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PythonQuestion' }],
    topicPerformance: {
      variables: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      data_types: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      operators: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lists: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      conditions: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      loops: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      functions: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      debugging: { accuracy: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    }
  },
  // Advanced Gamification
  skillTreeProgress: {
    type: [String],
    default: ['prog_1', 'logic_1', 'solve_1'] // Start nodes unlocked
  },
  dailyChallenges: {
    lastCompletedDate: { type: Date },
    streak: { type: Number, default: 0 },
    currentChallenges: [{
      challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge' },
      progress: { type: Number, default: 0 },
      isCompleted: { type: Boolean, default: false },
      isClaimed: { type: Boolean, default: false }
    }]
  },
  performanceMetrics: {
    accuracy: { type: Number, default: 0.5 }, // 0 to 1
    avgSpeed: { type: Number, default: 30 }, // seconds
    totalMistakes: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
