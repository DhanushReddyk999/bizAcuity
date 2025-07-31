const db = require('./db');

// Delete unverified users with expired OTPs (signup)
db.query(
  "DELETE FROM users WHERE is_verified = 0 AND otp_expiry < NOW()",
  (err, result) => {
    if (err) {
      console.error("Error deleting unverified users:", err);
    } else {
      console.log("Deleted unverified users:", result.affectedRows);
    }
  }
);

// Clear OTP fields for verified users with expired OTPs (email change, password reset)
db.query(
  "UPDATE users SET otp = NULL, otp_expiry = NULL, pending_email = NULL WHERE otp_expiry < NOW() AND is_verified = 1",
  (err, result) => {
    if (err) {
      console.error("Error clearing expired OTPs:", err);
    } else {
      console.log("Cleared expired OTPs for verified users:", result.affectedRows);
    }
    process.exit(0); // Exit after both queries
  }
); 