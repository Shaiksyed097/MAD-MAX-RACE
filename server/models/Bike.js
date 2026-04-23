const mongoose = require('mongoose');

const BikeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a bike name']
  },
  cc: {
    type: Number,
    required: [true, 'Please add engine CC']
  },
  type: {
    type: String,
    enum: ['track', 'personal'],
    default: 'track'
  },
  rentalPrice: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bike', BikeSchema);
