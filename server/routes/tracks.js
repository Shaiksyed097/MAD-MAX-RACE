const express = require('express');
const { getTracks, createTrack } = require('../controllers/trackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTracks)
  .post(protect, authorize('admin'), createTrack);

module.exports = router;
