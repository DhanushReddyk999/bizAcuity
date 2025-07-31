const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../notification');
const { validatePassword } = require('../utils/passwordValidation');

const config = require('../config');

// Configure nodemailer (example with Gmail, replace with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: config.EMAIL.SERVICE,
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASS,
  },
});

// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password does not meet requirements',
      details: passwordValidation.errors 
    });
  }
  
  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  try {
    const hash = await bcrypt.hash(password, 10);
    // Insert user with is_verified = false, store OTP and expiry
    db.query(
      'INSERT INTO users (username, email, pwd, is_verified, otp, otp_expiry) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hash, false, otp, otp_expiry],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: 'Email already registered' });
          }
          return res.status(500).json({ success: false, error: err.message });
        }
        // Send OTP email
        transporter.sendMail({
          from: config.EMAIL.FROM,
          to: email,
          subject: 'Your Verification Code',
          text: `Your verification code is: ${otp}`,
        }, (mailErr, info) => {
          if (mailErr) {
            return res.status(500).json({ success: false, error: 'Failed to send email' });
          }
          res.json({ success: true });
        });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email required' });
  }
  
  try {
    // Check if user exists and is not verified
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT username, is_verified FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return reject(new Error('User not found'));
        resolve(results);
      });
    });
    
    if (user.is_verified) {
      return res.status(400).json({ success: false, error: 'User is already verified' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    
    // Update OTP in database
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, otp_expiry, email], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    // Send new OTP email
    await new Promise((resolve, reject) => {
      transporter.sendMail({
        from: config.EMAIL.FROM,
        to: email,
        subject: 'Your Verification Code (Resent)',
        text: `Your new verification code is: ${otp}`,
      }, (mailErr, info) => {
        if (mailErr) return reject(mailErr);
        resolve();
      });
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  db.query(
    'SELECT otp, otp_expiry FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (!results || results.length === 0) return res.status(400).json({ success: false, error: 'User not found' });
      const user = results[0];
      const now = new Date();
      if (!user.otp || !user.otp_expiry || now > user.otp_expiry) {
        // Expired or missing: delete user
        db.query('DELETE FROM users WHERE email = ?', [email], (delErr) => {
          if (delErr) return res.status(500).json({ success: false, error: delErr.message });
          return res.status(400).json({ success: false, error: 'OTP expired. Please sign up again.' });
        });
        return;
      }
      if (user.otp !== otp) {
        return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }
      // OTP valid
      db.query(
        'UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?',
        [email],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });
          // Fetch username for welcome email
          db.query('SELECT username FROM users WHERE email = ?', [email], async (err, results) => {
            if (!err && results && results.length > 0) {
              try {
                await sendWelcomeEmail(email, results[0].username);
              } catch (err) {}
            }
            res.json({ success: true });
          });
        }
      );
    }
  );
});

// Request password reset (send OTP)
router.post('/request-reset', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email required' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, error: 'No account found with this email' });
    const user = results[0];
    if (!user.is_verified) return res.status(400).json({ success: false, error: 'This email is not verified. Please complete verification first.' });
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    db.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, otp_expiry, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });
      transporter.sendMail({
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Your Password Reset Code',
        text: `Your password reset code is: ${otp}`,
      }, (mailErr, info) => {
        if (mailErr) return res.status(500).json({ success: false, error: 'Failed to send email' });
        res.json({ success: true });
      });
    });
  });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password does not meet requirements',
      details: passwordValidation.errors 
    });
  }
  
  db.query('SELECT otp, otp_expiry FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, error: 'User not found' });
    const user = results[0];
    const now = new Date();
    if (!user.otp || !user.otp_expiry || now > user.otp_expiry) {
      db.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?', [email]);
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
    const hash = await bcrypt.hash(password, 10);
    db.query('UPDATE users SET pwd = ?, otp = NULL, otp_expiry = NULL WHERE email = ?', [hash, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });
      res.json({ success: true });
    });
  });
});

// Request email change (send OTP to new email)
router.post('/request-email-change', (req, res) => {
  const { userId, newEmail } = req.body;
  if (!userId || !newEmail) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [newEmail], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results && results.length > 0) return res.status(400).json({ success: false, error: 'Email already in use' });
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    db.query('UPDATE users SET otp = ?, otp_expiry = ?, pending_email = ? WHERE id = ?', [otp, otp_expiry, newEmail, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });
      transporter.sendMail({
        from: 'your_email@gmail.com',
        to: newEmail,
        subject: 'Your Email Change Verification Code',
        text: `Your email change verification code is: ${otp}`,
      }, (mailErr, info) => {
        if (mailErr) return res.status(500).json({ success: false, error: 'Failed to send email' });
        res.json({ success: true });
      });
    });
  });
});

// Verify email change
router.post('/verify-email-change', (req, res) => {
  const { userId, newEmail, otp } = req.body;
  if (!userId || !newEmail || !otp) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  db.query('SELECT otp, otp_expiry, pending_email FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, error: 'User not found' });
    const user = results[0];
    const now = new Date();
    if (!user.otp || !user.otp_expiry || now > user.otp_expiry || user.pending_email !== newEmail) {
      db.query('UPDATE users SET otp = NULL, otp_expiry = NULL, pending_email = NULL WHERE id = ?', [userId]);
      return res.status(400).json({ success: false, error: 'OTP expired or invalid request' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
    db.query('UPDATE users SET email = ?, otp = NULL, otp_expiry = NULL, pending_email = NULL WHERE id = ?', [newEmail, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });
      res.json({ success: true });
    });
  });
});

module.exports = router; 