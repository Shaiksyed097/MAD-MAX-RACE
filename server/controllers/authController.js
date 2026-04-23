const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { registrationWelcome } = require('../utils/emailTemplates');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp || 0,
      level: user.level || 1,
      rank: user.rank || 'Rookie',
      wins: user.wins || 0,
      podiums: user.podiums || 0,
      totalRaces: user.totalRaces || 0,
      bestLapTime: user.bestLapTime || null
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, age, drivingLicense, ownBike } = req.body;

    // Check age logic
    if (age < 18) {
       return res.status(400).json({ success: false, message: 'You must be at least 18 years old.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'rider',
      age,
      drivingLicense,
      ownBike
    });

    // Send welcome email (non-blocking)
    try {
      await sendEmail({
        to: email,
        subject: '🏍️ Welcome to MAD MAX RACE — License Granted!',
        html: registrationWelcome({ name }),
      });
    } catch (emailErr) {
      console.error('Welcome email failed (non-blocking):', emailErr.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
