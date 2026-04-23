const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a track name'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  length: {
    type: String, // e.g., '5.4 km'
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Track', TrackSchema);
