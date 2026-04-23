const express = require('express');
const { getRaceResults, getMyResults, getLeaderboard, publishResults } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/race/:raceId', getRaceResults);
router.get('/my', protect, getMyResults);
router.post('/publish', protect, authorize('admin'), publishResults);

module.exports = router;
