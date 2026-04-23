const Race = require('../models/Race');

// @desc    Get all races
// @route   GET /api/races
// @access  Public
exports.getRaces = async (req, res) => {
  try {
    const races = await Race.find().populate('track');
    res.status(200).json({ success: true, count: races.length, data: races });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a race
// @route   POST /api/races
// @access  Private/Admin
exports.createRace = async (req, res) => {
  try {
    const race = await Race.create(req.body);
    res.status(201).json({ success: true, data: race });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
