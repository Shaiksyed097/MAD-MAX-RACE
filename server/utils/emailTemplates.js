/**
 * Email templates for MAD MAX RACE
 */

const bookingConfirmation = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #f97316, #ef4444); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: 3px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { background: #1e293b; padding: 30px; }
    .greeting { color: #f8fafc; font-size: 20px; margin-bottom: 20px; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e293b; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; font-size: 14px; }
    .value { color: #f8fafc; font-size: 14px; font-weight: 600; text-align: right; }
    .total-row { display: flex; justify-content: space-between; padding: 15px 0 0; border-top: 2px solid #334155; margin-top: 10px; }
    .total-label { color: #f8fafc; font-size: 18px; font-weight: 700; }
    .total-value { color: #f97316; font-size: 22px; font-weight: 700; }
    .badge { display: inline-block; background: #22c55e20; color: #22c55e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .footer { background: #1e293b; padding: 20px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #334155; }
    .footer p { color: #64748b; font-size: 12px; margin: 4px 0; }
    .cta { display: inline-block; background: #f97316; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 700; font-size: 16px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏁 MAD MAX RACE</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="body">
      <p class="greeting">Hey ${data.riderName}! 🏍️</p>
      <p style="color: #94a3b8; line-height: 1.6;">
        Your race booking has been confirmed. Get ready to burn some rubber!
      </p>

      <div class="card">
        <div class="row">
          <span class="label">Race</span>
          <span class="value">${data.raceTitle}</span>
        </div>
        <div class="row">
          <span class="label">Track</span>
          <span class="value">${data.trackName}</span>
        </div>
        <div class="row">
          <span class="label">Location</span>
          <span class="value">${data.trackLocation}</span>
        </div>
        <div class="row">
          <span class="label">Date</span>
          <span class="value">${data.raceDate}</span>
        </div>
        <div class="row">
          <span class="label">Time</span>
          <span class="value">${data.raceTime}</span>
        </div>
        <div class="row">
          <span class="label">Bike</span>
          <span class="value">${data.bikeDetails}</span>
        </div>
        <div class="row">
          <span class="label">Gear</span>
          <span class="value">${data.gearDetails}</span>
        </div>
      </div>

      <div class="card">
        <div class="row">
          <span class="label">Track Fee</span>
          <span class="value">₹${data.trackFee}</span>
        </div>
        ${data.bikeRentFee > 0 ? `<div class="row"><span class="label">Bike Rental</span><span class="value">₹${data.bikeRentFee}</span></div>` : ''}
        ${data.gearRentFee > 0 ? `<div class="row"><span class="label">Gear Rental</span><span class="value">₹${data.gearRentFee}</span></div>` : ''}
        <div class="total-row">
          <span class="total-label">Total Paid</span>
          <span class="total-value">₹${data.totalAmount}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <span class="badge">✅ PAYMENT SUCCESSFUL</span>
      </div>
      <p style="color: #94a3b8; font-size: 13px; text-align: center;">
        Transaction ID: ${data.transactionId}
      </p>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" class="cta">View Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>MAD MAX RACE — India's Premier Bike Racing Platform</p>
      <p>This is an automated message. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const registrationWelcome = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #f97316, #ef4444); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: 3px; }
    .body { background: #1e293b; padding: 30px; border-radius: 0 0 12px 12px; }
    .greeting { color: #f8fafc; font-size: 22px; margin-bottom: 15px; }
    .cta { display: inline-block; background: #f97316; color: #fff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 700; font-size: 16px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏁 MAD MAX RACE</h1>
    </div>
    <div class="body">
      <p class="greeting">Welcome aboard, ${data.name}! 🏍️</p>
      <p style="color: #94a3b8; line-height: 1.8; font-size: 15px;">
        Your racing license has been granted. You're now part of the MAD MAX RACE community — India's premier bike racing platform.
      </p>
      <p style="color: #94a3b8; line-height: 1.8; font-size: 15px;">
        Head over to the dashboard to browse upcoming races, choose your machine, and book your first slot!
      </p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/bookings" class="cta">Browse Races →</a>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
        MAD MAX RACE — Unleash Your Inner Demon
      </p>
    </div>
  </div>
</body>
</html>
`;

module.exports = { bookingConfirmation, registrationWelcome };
