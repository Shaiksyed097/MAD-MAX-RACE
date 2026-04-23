const RaceResult = require('../models/RaceResult');
const Race = require('../models/Race');
const User = require('../models/User');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');

// XP rewards by position
const XP_TABLE = {
  1: 1000, // Winner
  2: 700,  // 2nd
  3: 500,  // 3rd (Podium)
  4: 350,
  5: 250,
  6: 200,
  7: 150,
  8: 100,
  9: 75,
  10: 50,
};
const PARTICIPATION_XP = 30;

// @desc    Get results for a specific race
// @route   GET /api/results/race/:raceId
// @access  Public
exports.getRaceResults = async (req, res) => {
  try {
    const results = await RaceResult.find({ race: req.params.raceId })
      .populate('rider', 'name email level rank xp')
      .sort({ position: 1 });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all results for the logged-in rider
// @route   GET /api/results/my
// @access  Private
exports.getMyResults = async (req, res) => {
  try {
    const results = await RaceResult.find({ rider: req.user.id })
      .populate({ path: 'race', populate: { path: 'track' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get global leaderboard
// @route   GET /api/results/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider', totalRaces: { $gt: 0 } })
      .select('name xp level rank wins podiums totalRaces bestLapTime')
      .sort({ xp: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: riders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin publishes results for a race (awards XP, updates levels)
// @route   POST /api/results/publish
// @access  Private/Admin
exports.publishResults = async (req, res) => {
  try {
    const { raceId, results } = req.body;
    // results = [{ riderId, position, lapTime, penalties, remarks }]

    if (!raceId || !results || !results.length) {
      return res.status(400).json({ success: false, message: 'raceId and results array required' });
    }

    const race = await Race.findById(raceId).populate('track');
    if (!race) {
      return res.status(404).json({ success: false, message: 'Race not found' });
    }

    const savedResults = [];

    for (const r of results) {
      const xpEarned = XP_TABLE[r.position] || PARTICIPATION_XP;

      // Create or update result
      const result = await RaceResult.findOneAndUpdate(
        { race: raceId, rider: r.riderId },
        {
          race: raceId,
          rider: r.riderId,
          position: r.position,
          lapTime: r.lapTime,
          penalties: r.penalties || 0,
          xpEarned,
          remarks: r.remarks || '',
        },
        { upsert: true, new: true }
      );
      savedResults.push(result);

      // Update rider stats
      const rider = await User.findById(r.riderId);
      if (rider) {
        rider.xp += xpEarned;
        rider.totalRaces += 1;
        if (r.position === 1) rider.wins += 1;
        if (r.position <= 3) rider.podiums += 1;
        if (!rider.bestLapTime || r.lapTime < rider.bestLapTime) {
          rider.bestLapTime = r.lapTime;
        }

        // Recalculate level
        const levelInfo = rider.calculateLevel();
        await rider.save();

        // Send result notification email (non-blocking)
        try {
          const positionSuffix = r.position === 1 ? 'st' : r.position === 2 ? 'nd' : r.position === 3 ? 'rd' : 'th';
          const isWin = r.position === 1;
          const isPodium = r.position <= 3;

          await sendEmail({
            to: rider.email,
            subject: isWin
              ? `🏆 VICTORY! You won ${race.title}! | MAD MAX RACE`
              : isPodium
              ? `🥇 Podium Finish! ${r.position}${positionSuffix} in ${race.title} | MAD MAX RACE`
              : `🏁 Race Results — ${race.title} | MAD MAX RACE`,
            html: `
              <!DOCTYPE html><html><head><meta charset="utf-8">
              <style>
                body{margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif}
                .c{max-width:600px;margin:0 auto}
                .h{background:linear-gradient(135deg,${isWin ? '#f59e0b,#ef4444' : isPodium ? '#8b5cf6,#3b82f6' : '#475569,#1e293b'});padding:30px;text-align:center;border-radius:12px 12px 0 0}
                .h h1{color:#fff;margin:0;font-size:28px}
                .h p{color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px}
                .b{background:#1e293b;padding:30px}
                .g{color:#f8fafc;font-size:22px;margin-bottom:15px}
                .card{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin:20px 0}
                .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1e293b}
                .row:last-child{border-bottom:none}
                .label{color:#94a3b8;font-size:14px}
                .value{color:#f8fafc;font-size:14px;font-weight:600}
                .xp{display:inline-block;background:#f97316;color:#fff;padding:8px 20px;border-radius:20px;font-size:16px;font-weight:700;margin:10px 0}
                .f{background:#1e293b;padding:20px 30px;text-align:center;border-radius:0 0 12px 12px;border-top:1px solid #334155}
                .f p{color:#64748b;font-size:12px;margin:4px 0}
              </style></head><body><div class="c">
                <div class="h">
                  <h1>${isWin ? '🏆 VICTORY!' : isPodium ? '🥇 PODIUM!' : '🏁 RACE COMPLETE'}</h1>
                  <p>${race.title}</p>
                </div>
                <div class="b">
                  <p class="g">Hey ${rider.name}! ${isWin ? '🎉' : '🏍️'}</p>
                  <p style="color:#94a3b8;line-height:1.6">
                    ${isWin
                      ? 'Incredible! You dominated the track and crossed the line first!'
                      : isPodium
                      ? `Amazing ride! You finished ${r.position}${positionSuffix} and earned a podium spot!`
                      : `Great effort! You finished ${r.position}${positionSuffix} in the race.`}
                  </p>
                  <div class="card">
                    <div class="row"><span class="label">Position</span><span class="value">${r.position}${positionSuffix}</span></div>
                    <div class="row"><span class="label">Lap Time</span><span class="value">${r.lapTime}</span></div>
                    <div class="row"><span class="label">Track</span><span class="value">${race.track?.name || 'Track'}</span></div>
                    <div class="row"><span class="label">Penalties</span><span class="value">${r.penalties || 0}s</span></div>
                  </div>
                  <div style="text-align:center">
                    <span class="xp">+${xpEarned} XP Earned</span>
                    <p style="color:#94a3b8;font-size:14px">Level ${rider.level} — ${rider.rank} (${rider.xp} XP total)</p>
                  </div>
                </div>
                <div class="f"><p>MAD MAX RACE — India's Premier Bike Racing Platform</p></div>
              </div></body></html>
            `,
          });
        } catch (emailErr) {
          console.error('Result email failed (non-blocking):', emailErr.message);
        }
      }
    }

    // Mark race as completed
    race.status = 'completed';
    await race.save();

    res.status(201).json({ success: true, count: savedResults.length, data: savedResults });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
