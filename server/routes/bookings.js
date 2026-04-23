const express = require('express');
const { getMyBookings, getAllBookings, createBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getAllBookings)
  .post(protect, createBooking);

router.route('/my')
  .get(protect, getMyBookings);

module.exports = router;
