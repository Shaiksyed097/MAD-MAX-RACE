const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lapTimes: [{
    lapNumber: Number,
    time: String // e.g. "1:45.32"
  }],
  bestLap: {
    type: String
  },
  mistakes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Qualified', 'Not Qualified', 'Pending', 'Did Not Finish', 'Disqualified'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', ResultSchema);
