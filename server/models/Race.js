const mongoose = require('mongoose');

const RaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  categoryRange: {
    minCC: Number,
    maxCC: Number
  },
  totalSlots: {
    type: Number,
    default: 10
  },
  availableSlots: {
    type: Number,
    default: 10
  },
  fee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Race', RaceSchema);
