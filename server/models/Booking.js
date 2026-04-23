const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  // Bike selection
  bikeChoice: {
    type: String,
    enum: ['own', 'track'],
    required: true
  },
  ownBikeName: String,
  ownBikeCC: Number,
  trackBike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike'
  },
  // Gear
  gearChoice: {
    type: String,
    enum: ['own', 'rent'],
    default: 'own'
  },
  rentedGear: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gear'
  }],
  // Pricing breakdown
  trackFee: { type: Number, default: 0 },
  bikeRentFee: { type: Number, default: 0 },
  gearRentFee: { type: Number, default: 0 },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
