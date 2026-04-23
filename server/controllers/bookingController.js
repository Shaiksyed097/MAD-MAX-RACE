const Booking = require('../models/Booking');
const Race = require('../models/Race');
const Bike = require('../models/Bike');
const Gear = require('../models/Gear');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { bookingConfirmation } = require('../utils/emailTemplates');
const crypto = require('crypto');

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({ path: 'race', populate: { path: 'track' } })
      .populate('trackBike')
      .populate('rentedGear')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'race', populate: { path: 'track' } })
      .populate('trackBike')
      .populate('rentedGear')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a booking (with simulated payment)
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { race: raceId, bikeChoice, ownBikeName, ownBikeCC, trackBike, gearChoice, rentedGear, paymentMethod, cardLast4 } = req.body;

    // Check race exists
    const race = await Race.findById(raceId).populate('track');
    if (!race) {
      return res.status(404).json({ success: false, message: 'Race not found' });
    }

    if (race.availableSlots < 1) {
      return res.status(400).json({ success: false, message: 'No slots available for this race' });
    }

    // Prevent double booking
    const existingBooking = await Booking.findOne({ user: req.user.id, race: raceId });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked this race' });
    }

    // Calculate fees
    let trackFee = race.fee;
    let bikeRentFee = 0;
    let gearRentFee = 0;
    let bikeDetails = '';
    let gearDetails = 'Own Gear';

    // Bike rental
    if (bikeChoice === 'track' && trackBike) {
      const bike = await Bike.findById(trackBike);
      if (bike) {
        bikeRentFee = bike.rentalPrice;
        bikeDetails = `${bike.name} (${bike.cc}cc) — Rented`;
      }
    } else {
      bikeDetails = `${ownBikeName || 'Own Bike'} (${ownBikeCC || '?'}cc) — Own`;
    }

    // Gear rental
    let gearItemNames = [];
    if (gearChoice === 'rent' && rentedGear && rentedGear.length > 0) {
      const gearItems = await Gear.find({ _id: { $in: rentedGear } });
      gearRentFee = gearItems.reduce((sum, g) => sum + g.rentalPrice, 0);
      gearItemNames = gearItems.map(g => g.name);
      gearDetails = gearItemNames.join(', ');
    }

    const totalAmount = trackFee + bikeRentFee + gearRentFee;

    // Generate a fake transaction ID
    const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();

    const booking = await Booking.create({
      user: req.user.id,
      race: raceId,
      bikeChoice,
      ownBikeName: bikeChoice === 'own' ? ownBikeName : undefined,
      ownBikeCC: bikeChoice === 'own' ? ownBikeCC : undefined,
      trackBike: bikeChoice === 'track' ? trackBike : undefined,
      gearChoice,
      rentedGear: gearChoice === 'rent' ? rentedGear : [],
      trackFee,
      bikeRentFee,
      gearRentFee,
      totalAmount,
      paymentStatus: 'completed',
      transactionId,
    });

    // Reduce available slots
    race.availableSlots -= 1;
    await race.save();

    // ─── SEND CONFIRMATION EMAIL ────
    const user = await User.findById(req.user.id);
    try {
      await sendEmail({
        to: user.email,
        subject: `🏁 Booking Confirmed — ${race.title} | MAD MAX RACE`,
        html: bookingConfirmation({
          riderName: user.name,
          raceTitle: race.title,
          trackName: race.track?.name || 'Track',
          trackLocation: race.track?.location || '',
          raceDate: new Date(race.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          raceTime: race.time,
          bikeDetails,
          gearDetails,
          trackFee,
          bikeRentFee,
          gearRentFee,
          totalAmount,
          transactionId,
        }),
      });
    } catch (emailErr) {
      console.error('Email sending failed (non-blocking):', emailErr.message);
      // Don't fail the booking if email fails
    }

    // Populate for response
    const populated = await Booking.findById(booking._id)
      .populate({ path: 'race', populate: { path: 'track' } })
      .populate('trackBike')
      .populate('rentedGear');

    res.status(201).json({
      success: true,
      data: populated,
      transactionId,
      emailSent: true,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
