const express = require('express');
const { getBikes, createBike, updateBike, deleteBike } = require('../controllers/bikeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getBikes)
  .post(protect, authorize('admin'), createBike);

router.route('/:id')
  .put(protect, authorize('admin'), updateBike)
  .delete(protect, authorize('admin'), deleteBike);

module.exports = router;
