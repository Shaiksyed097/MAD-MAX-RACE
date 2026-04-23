const nodemailer = require('nodemailer');

let cachedTransporter = null;
let etherealAccount = null;

/**
 * Get or create a transporter.
 * Uses real SMTP if configured, otherwise creates an Ethereal test account.
 */
const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // Option 1: Real SMTP (Gmail)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Email configured with SMTP:', process.env.EMAIL_USER);
    return cachedTransporter;
  }

  // Option 2: Ethereal test account (free, no config needed, shows preview URL)
  try {
    etherealAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
    console.log('📧 Email configured with Ethereal test account:', etherealAccount.user);
    console.log('   View sent emails at: https://ethereal.email/login');
    console.log('   Ethereal User:', etherealAccount.user);
    console.log('   Ethereal Pass:', etherealAccount.pass);
    return cachedTransporter;
  } catch (err) {
    console.error('📧 Failed to create Ethereal account:', err.message);
    return null;
  }
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 * @returns {Object} - { messageId, previewUrl }
 */
const sendEmail = async (options) => {
  const transporter = await getTransporter();

  if (!transporter) {
    console.log('📧 [EMAIL SKIPPED] No email transport available.');
    return { skipped: true };
  }

  const fromAddress = process.env.EMAIL_USER || etherealAccount?.user || 'noreply@madmaxrace.com';

  const mailOptions = {
    from: `"MAD MAX RACE 🏁" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully!');
    console.log('   To:', options.to);
    console.log('   Subject:', options.subject);
    console.log('   MessageID:', info.messageId);

    // If using Ethereal, show the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('   ⭐ Preview URL:', previewUrl);
    }

    return { messageId: info.messageId, previewUrl: previewUrl || null };
  } catch (err) {
    console.error('📧 Failed to send email:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
