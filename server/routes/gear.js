const express = require('express');
const { getGear, createGear } = require('../controllers/gearController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getGear)
  .post(protect, authorize('admin'), createGear);

module.exports = router;
