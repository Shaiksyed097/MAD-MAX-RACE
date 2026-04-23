const mongoose = require('mongoose');

const RaceResultSchema = new mongoose.Schema({
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  lapTime: {
    type: String, // e.g., "1:42.350"
    required: true
  },
  penalties: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate results for same rider in same race
RaceResultSchema.index({ race: 1, rider: 1 }, { unique: true });

module.exports = mongoose.model('RaceResult', RaceResultSchema);
