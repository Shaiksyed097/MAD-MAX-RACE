const Track = require('../models/Track');

// @desc    Get all tracks
// @route   GET /api/tracks
// @access  Public
exports.getTracks = async (req, res) => {
  try {
    const tracks = await Track.find();
    res.status(200).json({ success: true, count: tracks.length, data: tracks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a track
// @route   POST /api/tracks
// @access  Private/Admin
exports.createTrack = async (req, res) => {
  try {
    const track = await Track.create(req.body);
    res.status(201).json({ success: true, data: track });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
