const express = require('express');
const { getAdminStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/admin')
  .get(protect, authorize('admin'), getAdminStats);

module.exports = router;
