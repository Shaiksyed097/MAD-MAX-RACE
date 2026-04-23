const Gear = require('../models/Gear');

// @desc    Get all gear items
// @route   GET /api/gear
// @access  Public
exports.getGear = async (req, res) => {
  try {
    const gear = await Gear.find();
    res.status(200).json({ success: true, count: gear.length, data: gear });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create gear item
// @route   POST /api/gear
// @access  Private/Admin
exports.createGear = async (req, res) => {
  try {
    const gear = await Gear.create(req.body);
    res.status(201).json({ success: true, data: gear });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
