const User = require('../models/User');
const Booking = require('../models/Booking');
const Race = require('../models/Race');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const riders = await User.countDocuments({ role: 'rider' });
    const races = await Race.countDocuments();
    const bookings = await Booking.find();
    
    const revenue = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRiders: riders,
        totalRaces: races,
        totalBookings: bookings.length,
        totalRevenue: revenue
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
