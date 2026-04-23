const express = require('express');
const { getRaces, createRace } = require('../controllers/raceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getRaces)
  .post(protect, authorize('admin'), createRace);

module.exports = router;
