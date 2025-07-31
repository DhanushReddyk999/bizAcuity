const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
  service: config.EMAIL.SERVICE,
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASS,
  },
});

function sendUserNotification(email, subject, message) {
  return transporter.sendMail({
    from: config.EMAIL.FROM,
    to: email,
    subject,
    text: message,
    html: `<div style="font-family:sans-serif;line-height:1.7;font-size:1.1em;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:18px 0;border-radius:10px 10px 0 0;text-align:center;">
        <h2 style="margin:0;">Virtual Wall Notification</h2>
      </div>
      <div style="background:#fff;padding:24px 24px 18px 24px;border-radius:0 0 10px 10px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <div style="margin-top:18px;text-align:center;color:#999;font-size:0.95em;">This is an automated notification from Virtual Wall. Please do not reply.</div>
    </div>`
  });
}

// 1. Registration (after verification)
async function sendWelcomeEmail(email, username) {
  const subject = 'Welcome to Virtual Wall!';
  const message = `Hi ${username},\n\nYour account has been successfully created and verified.\n\nEnjoy using Virtual Wall!`;
  return sendUserNotification(email, subject, message);
}

// 2. Account Deletion
async function sendAccountDeletionEmail(email, username) {
  const subject = 'Your Virtual Wall Account Has Been Deleted';
  const message = `Hi ${username},\n\nYour account has been deleted. If this was not you, please contact support immediately.`;
  return sendUserNotification(email, subject, message);
}

// 3. Account Edit (profile changes)
async function sendProfileEditEmail(email, username) {
  const subject = 'Your Virtual Wall Profile Was Updated';
  const message = `Hi ${username},\n\nYour profile information was updated. If you did not make this change, please contact support.`;
  return sendUserNotification(email, subject, message);
}

// 4. Password Reset
async function sendPasswordResetEmail(email, username) {
  const subject = 'Your Virtual Wall Password Was Reset';
  const message = `Hi ${username},\n\nYour password was reset. If you did not request this, please contact support immediately.`;
  return sendUserNotification(email, subject, message);
}

// 5. Password Change
async function sendPasswordChangeEmail(email, username) {
  const subject = 'Your Virtual Wall Password Was Changed';
  const message = `Hi ${username},\n\nYour password was changed. If you did not make this change, please contact support immediately.`;
  return sendUserNotification(email, subject, message);
}

module.exports = {
  sendUserNotification,
  sendWelcomeEmail,
  sendAccountDeletionEmail,
  sendProfileEditEmail,
  sendPasswordResetEmail,
  sendPasswordChangeEmail,
}; 