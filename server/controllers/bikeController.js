const Bike = require('../models/Bike');

// @desc    Get all track bikes
// @route   GET /api/bikes
// @access  Public
exports.getBikes = async (req, res) => {
  try {
    const bikes = await Bike.find({ type: 'track' });
    res.status(200).json({ success: true, count: bikes.length, data: bikes });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a bike
// @route   POST /api/bikes
// @access  Private/Admin
exports.createBike = async (req, res) => {
  try {
    const bike = await Bike.create(req.body);
    res.status(201).json({ success: true, data: bike });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update bike availability
// @route   PUT /api/bikes/:id
// @access  Private/Admin
exports.updateBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bike) return res.status(404).json({ success: false, message: 'Bike not found' });
    res.status(200).json({ success: true, data: bike });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a bike
// @route   DELETE /api/bikes/:id
// @access  Private/Admin
exports.deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) return res.status(404).json({ success: false, message: 'Bike not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
