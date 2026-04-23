const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['rider', 'admin'],
    default: 'rider'
  },
  age: {
    type: Number,
    required: [true, 'Please add your age']
  },
  drivingLicense: {
    type: String, // Cloudinary URL
    default: ''
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  ownBike: {
    name: String,
    cc: Number
  },
  // ─── RACING STATS & LEVEL SYSTEM ────
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  rank: {
    type: String,
    default: 'Rookie'
  },
  totalRaces: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  podiums: {
    type: Number,
    default: 0
  },
  bestLapTime: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate level and rank from XP
UserSchema.methods.calculateLevel = function() {
  // Each level requires more XP: Level N needs N*500 XP total
  const xpThresholds = [
    { level: 1, xp: 0, rank: 'Rookie' },
    { level: 2, xp: 500, rank: 'Amateur' },
    { level: 3, xp: 1500, rank: 'Semi-Pro' },
    { level: 4, xp: 3000, rank: 'Pro' },
    { level: 5, xp: 5000, rank: 'Expert' },
    { level: 6, xp: 8000, rank: 'Elite' },
    { level: 7, xp: 12000, rank: 'Champion' },
    { level: 8, xp: 18000, rank: 'Legend' },
    { level: 9, xp: 25000, rank: 'MAD MAX' },
    { level: 10, xp: 35000, rank: 'Immortal' }
  ];

  let current = xpThresholds[0];
  for (const t of xpThresholds) {
    if (this.xp >= t.xp) current = t;
    else break;
  }
  this.level = current.level;
  this.rank = current.rank;
  return current;
};

module.exports = mongoose.model('User', UserSchema);
