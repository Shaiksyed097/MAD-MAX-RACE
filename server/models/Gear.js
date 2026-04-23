const mongoose = require('mongoose');

const GearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['helmet', 'gloves', 'suit', 'boots', 'full-kit'],
    required: true
  },
  rentalPrice: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gear', GearSchema);
