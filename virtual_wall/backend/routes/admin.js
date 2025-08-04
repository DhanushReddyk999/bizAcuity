const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../index');
const bcrypt = require('bcryptjs');
const { sendAccountDeletionEmail, sendProfileEditEmail } = require('../notification');
const { v4: uuidv4 } = require('uuid');
const { validatePassword } = require('../utils/passwordValidation');
const config = require('../config');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Delete a user by id (admin only, requires admin password)
router.delete("/admin/user/:id", authenticateToken, async (req, res) => {
  const { adminUsername, adminPassword } = req.body;
  const userId = req.params.id;
  if (!adminUsername || !adminPassword) {
    return res.status(400).send("Admin username and password required");
  }
  db.query("SELECT * FROM users WHERE username=?", [adminUsername], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(401).send("Invalid admin credentials");
    }
    const admin = result[0];
    if (admin.role !== 'admin') {
      return res.status(403).send("Not authorized");
    }
    const valid = await bcrypt.compare(adminPassword, admin.pwd);
    if (!valid) {
      return res.status(401).send("Incorrect admin password");
    }
    // Fetch user email and username before deleting
    db.query("SELECT email, username FROM users WHERE id=?", [userId], (err, userRows) => {
      if (err || userRows.length === 0) {
        return res.status(404).send("User not found");
      }
      const { email, username } = userRows[0];
      db.query("DELETE FROM users WHERE id=?", [userId], (err, result) => {
        if (err) return res.status(500).send("Failed to delete user");
        if (result.affectedRows === 0) return res.status(404).send("User not found");
        // Send email notification
        sendAccountDeletionEmail(email, username);
      });
    });
  });
});

// Update a user by id (admin only, requires admin password)
router.put("/user/:id", authenticateToken, async (req, res) => {
  const { username, email, role, adminUsername, adminPassword, plan_id, subscription_expires } = req.body;
  const userId = req.params.id;
  if (!username || !email || !role || !adminUsername || !adminPassword) {
    return res.status(400).send("Username, email, role, admin username, and admin password are required");
  }
  try {
    // Validate admin credentials
    const [admin] = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE username=?", [adminUsername], (err, result) => {
        if (err || result.length === 0) { return reject("Invalid admin credentials"); }
        resolve(result);
      });
    });
    if (admin.role !== 'admin') { return res.status(403).send("Not authorized"); }
    const valid = await bcrypt.compare(adminPassword, admin.pwd);
    if (!valid) { return res.status(401).send("Incorrect admin password"); }

    // Fetch current user
    const [userRow] = await new Promise((resolve, reject) => {
      db.query("SELECT email, username, role FROM users WHERE id=?", [userId], (err, result) => {
        if (err || result.length === 0) { return reject("User not found"); }
        resolve(result);
      });
    });
    const currentEmail = userRow.email;
    const currentUsername = userRow.username;
    let planIdToUse = plan_id;

    // If admin, always set to premium plan
    if (role === 'admin') {
      const [premiumPlan] = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM plans WHERE LOWER(name) = "premium"', (err, result) => {
          if (err || result.length === 0) { return reject("Premium plan not found"); }
          resolve(result);
        });
      });
      planIdToUse = premiumPlan.id;
    }

    // If email is changed, trigger verification
    if (email !== currentEmail) {
      const otp = generateOTP();
      const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE users SET username=?, role=?, plan_id=?, pending_email=?, otp=?, otp_expiry=? WHERE id=?",
          [username, role, planIdToUse, email, otp, otp_expiry, userId],
          (err, result) => {
            if (err) return reject("Failed to update user (pending email)");
            resolve();
          }
        );
      });
      // Send OTP to new email
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: config.EMAIL.SERVICE,
        auth: {
          user: config.EMAIL.USER,
          pass: config.EMAIL.PASS,
        },
      });
      await new Promise((resolve, reject) => {
        transporter.sendMail({
          from: config.EMAIL.FROM,
          to: email,
          subject: 'Your Email Change Verification Code',
          text: `Your email change verification code is: ${otp}`,
        }, (mailErr, info) => {
          if (mailErr) return reject("Failed to send verification email");
          resolve();
        });
      });
      return res.status(200).json({ pendingEmail: email, verificationRequired: true });
    }

    // If email is not changed, update directly
    // Build update query
    let fields = ["username=?", "role=?"];
    let values = [username, role];
    if (planIdToUse !== undefined && planIdToUse !== null) {
      fields.push("plan_id=?");
      values.push(planIdToUse);
    }
    let expiresToUse = subscription_expires;
    if (expiresToUse === '' || expiresToUse === undefined) {
      expiresToUse = null;
    }
    if (expiresToUse !== undefined) {
      fields.push("subscription_expires=?");
      values.push(expiresToUse);
    }
    values.push(userId);
    
    await new Promise((resolve, reject) => {
      db.query(`UPDATE users SET ${fields.join(", ")} WHERE id=?`, values, (err, result) => {
        if (err) { return reject("Failed to update user"); }
        if (result.affectedRows === 0) { return reject("User not found"); }
        resolve();
      });
    });
    await sendProfileEditEmail(currentEmail, username);
    return res.status(200).send("User updated successfully");
  } catch (err) {
    return res.status(500).send(err.toString());
  }
});

// Admin resends OTP for user email change
router.post('/admin/resend-email-change-otp', authenticateToken, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing user ID' });
  }
  try {
    const user = await new Promise((resolve, reject) => {
      db.query('SELECT pending_email FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return reject(new Error('User not found'));
        resolve(results[0]);
      });
    });
    
    const otp = generateOTP();
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, new Date(Date.now() + 5 * 60 * 1000), userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: config.EMAIL.SERVICE,
      auth: {
        user: config.EMAIL.USER,
        pass: config.EMAIL.PASS,
      },
    });
    
    await new Promise((resolve, reject) => {
      transporter.sendMail({
        from: config.EMAIL.FROM,
        to: user.pending_email,
        subject: 'Your Email Change Verification Code (Resent)',
        text: `Your new email change verification code is: ${otp}`,
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

// Admin verifies OTP for user email change
router.post('/admin/verify-email-change', authenticateToken, async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  db.query('SELECT otp, otp_expiry, pending_email, username FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, error: 'User not found' });
    const user = results[0];
    const now = new Date();
    if (!user.otp || !user.otp_expiry || now > user.otp_expiry) {
      db.query('UPDATE users SET otp = NULL, otp_expiry = NULL, pending_email = NULL WHERE id = ?', [userId]);
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
    db.query('UPDATE users SET email = ?, otp = NULL, otp_expiry = NULL, pending_email = NULL WHERE id = ?', [user.pending_email, userId], async (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });
      try {
        await sendProfileEditEmail(user.pending_email, user.username);
      } catch (err) {}
      res.json({ success: true });
    });
  });
});

// Get all verified users (admin only)
router.get("/users", authenticateToken, (req, res) => {
  db.query("SELECT users.id, users.username, users.email, users.role, users.plan_id, users.subscription_expires, plans.name AS plan_name FROM users LEFT JOIN plans ON users.plan_id = plans.id WHERE users.is_verified = 1", (err, results) => {
    if (err) return res.status(500).send("Error fetching users");
    return res.status(200).json(results);
  });
});

// Add a new user (admin only, requires admin credentials)
router.post("/admin/user", authenticateToken, async (req, res) => {
  const { username, email, role, password, adminUsername, adminPassword } = req.body;
  if (!username || !email || !role || !password || !adminUsername) {
    return res.status(400).send("All fields are required");
  }
  if (adminPassword) {
    db.query("SELECT * FROM users WHERE username=?", [adminUsername], async (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).send("Invalid admin credentials");
      }
      const admin = result[0];
      if (admin.role !== 'admin') {
        return res.status(403).send("Not authorized");
      }
      const valid = await bcrypt.compare(adminPassword, admin.pwd);
      if (!valid) {
        return res.status(401).send("Incorrect admin password");
      }
      addUser();
    });
  } else {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Not authorized");
    }
    addUser();
  }

  async function addUser() {
    try {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          success: false, 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors 
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      
      db.query("INSERT INTO users (username, email, pwd, role, otp, otp_expiry) VALUES (?, ?, ?, ?, ?, ?)", [username, email, hashedPassword, role, otp, new Date(Date.now() + 5 * 60 * 1000)], (err) => {
        if (err) {
          return res.status(500).send("Error adding user");
        }
        
        // Send OTP email
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: config.EMAIL.SERVICE,
          auth: {
            user: config.EMAIL.USER,
            pass: config.EMAIL.PASS,
          },
        });
        transporter.sendMail({
          from: config.EMAIL.FROM,
          to: email,
          subject: 'Your Verification Code',
          text: `Your verification code is: ${otp}`,
        }, (mailErr, info) => {
          if (mailErr) {
            return res.status(500).send("Failed to send verification email");
          }
          db.query("SELECT id, username, email, role FROM users WHERE username=?", [username], (err, users) => {
            if (err || users.length === 0) return res.status(500).send("User added but failed to fetch");
            return res.status(201).json(users[0]);
          });
        });
      });
    } catch (err) {
      return res.status(500).send("Error adding user");
    }
  }
});

// Get all drafts (admin only)
router.get("/drafts", authenticateToken, (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Not authorized");
  }
  db.query("SELECT * FROM walls", (err, results) => {
    if (err) return res.status(500).send("Error fetching drafts");
    return res.status(200).json(results);
  });
});

// Get a single user by id (admin only)
router.get("/user/:id", authenticateToken, (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Not authorized");
  }
  const userId = req.params.id;
  db.query("SELECT users.id, users.username, users.email, users.role, users.plan_id, users.subscription_expires, plans.name AS plan_name FROM users LEFT JOIN plans ON users.plan_id = plans.id WHERE users.id=?", [userId], (err, results) => {
    if (err) return res.status(500).send("Error fetching user");
    if (results.length === 0) return res.status(404).send("User not found");
    return res.status(200).json(results[0]);
  });
});

// Update user role (admin only)
router.put("/user/:id/role", authenticateToken, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Not authorized");
  }
  
  const userId = req.params.id;
  const { role } = req.body;
  
  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).send("Invalid role. Must be 'user' or 'admin'");
  }
  
  try {
    // First, get the current user to check if they're being demoted from admin
    db.query("SELECT role, plan_id FROM users WHERE id = ?", [userId], async (err, userResults) => {
      if (err) return res.status(500).send("Error fetching user");
      if (userResults.length === 0) return res.status(404).send("User not found");
      
      const currentUser = userResults[0];
      const isPromotingToAdmin = currentUser.role !== 'admin' && role === 'admin';
      const isDemotingFromAdmin = currentUser.role === 'admin' && role === 'user';
      
      let planIdToUse = currentUser.plan_id;
      let subscriptionExpires = null;
      
      if (isPromotingToAdmin) {
        // When promoting to admin, assign premium plan
        await new Promise((resolve) => {
          db.query('SELECT id FROM plans WHERE LOWER(name) = "premium"', (err, planResults) => {
            if (!err && planResults.length > 0) {
              planIdToUse = planResults[0].id;
            }
            resolve();
          });
        });
        // Set subscription to expire in 1 year for admin
        subscriptionExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      } else if (isDemotingFromAdmin) {
        // When demoting from admin, give premium plan for 1 month
         await new Promise((resolve) => {
           db.query('SELECT id FROM plans WHERE LOWER(name) = "premium"', (err, planResults) => {
             if (!err && planResults.length > 0) {
               planIdToUse = planResults[0].id;
             }
             resolve();
           });
         });
         // Set subscription to expire in 1 month for demoted admin
         subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
       }
      
      // Update user role and plan
      const updateQuery = `
        UPDATE users 
        SET role = ?, plan_id = ?, subscription_expires = ?
        WHERE id = ?
      `;
      
      db.query(updateQuery, [role, planIdToUse, subscriptionExpires, userId], (err, result) => {
        if (err) return res.status(500).send("Error updating user role");
        
        // Return updated user info
        db.query("SELECT users.id, users.username, users.email, users.role, users.plan_id, users.subscription_expires, plans.name AS plan_name FROM users LEFT JOIN plans ON users.plan_id = plans.id WHERE users.id=?", [userId], (err, results) => {
          if (err) return res.status(500).send("Error fetching updated user");
          if (results.length === 0) return res.status(404).send("User not found");
          
          const updatedUser = results[0];
          const message = isPromotingToAdmin 
            ? `User ${updatedUser.username} promoted to admin with premium plan` 
            : isDemotingFromAdmin 
            ? `User ${updatedUser.username} demoted from admin to user with premium status for 1 month`
            : `User ${updatedUser.username} role updated to ${role}`;
          
          return res.status(200).json({
            success: true,
            message: message,
            user: updatedUser
          });
        });
      });
    });
  } catch (err) {
    return res.status(500).send("Error updating user role");
  }
});

module.exports = router; 