const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const { sendAccountDeletionEmail, sendProfileEditEmail, sendPasswordChangeEmail } = require('../notification');
const { validatePassword } = require('../utils/passwordValidation');
const config = require('../config');
// const { authenticateToken } = require('../middleware/auth');

// Temporary authenticateToken function
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access denied. No token provided.");
  jwt.verify(token, config.JWT.SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token.");
    req.user = user;
    next();
  });
}

// SIGN UP — now hashes password before storing
router.post("/SignUp", async (req, res) => {
  let { username, password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let q = `INSERT INTO users(username,email,pwd) values(?)`;
    let data = [username, email, hashedPassword];
    db.query(q, [data], (err) => {
      if (err) {
        return res.status(500).send("user already exists enter diff email and username");
      }
      res.status(201).send("registration successful");
    });
  } catch (err) {
    return res.status(500).send("Error registering user");
  }
});

// LOGIN — securely compares hashed passwords
router.post("/Login", async (req, res) => {
  const { username, password } = req.body;
  let q = `SELECT * FROM users WHERE username = ?`;

  db.query(q, [username], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).send("User doesn't exist");
    }

    const user = result[0];

    // Block unverified users and delete them
    if (user.is_verified === 0) {
      db.query('DELETE FROM users WHERE username = ?', [username], (delErr) => {
        if (delErr) return res.status(500).send("Account not verified and failed to delete user");
        return res.status(403).send("Account not verified. Please sign up again.");
      });
      return;
    }

    // Securely compare password
    const isValid = await bcrypt.compare(password, user.pwd);
    if (!isValid) {
      return res.status(401).send("Invalid password");
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      config.JWT.SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      username: user.username,
      email: user.email,
      id: user.id,
      role: user.role,
      token,
    });
  });
});

// DELETE USER — now checks bcrypt before deleting
router.delete("/deleteUser", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password required");
  }

  let q = `SELECT * FROM users WHERE username=?`;
  db.query(q, [username], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).send("User not found");
    }

    const isValid = await bcrypt.compare(password, result[0].pwd);
    if (!isValid) {
      return res.status(401).send("Incorrect password");
    }

    let deleteDrafts = `DELETE FROM walls WHERE uid=?`;
    db.query(deleteDrafts, [result[0].id], (err) => {
      if (err) return res.status(500).send("Failed to delete user drafts");

      let deleteUser = `DELETE FROM users WHERE username=?`;
      db.query(deleteUser, [username], (err) => {
        if (err) return res.status(500).send("Failed to delete user");
        try {
          // sendAccountDeletionEmail(result[0].email, result[0].username);
        } catch (err) {
          console.error('Failed to send account deletion email:', err);
        }
        return res.status(200).send("User deleted successfully");
      });
    });
  });
});

// Update user (self-service, requires password)
router.put("/updateUser", async (req, res) => {
  const { id, username, email, password } = req.body;
  if (!id || !username || !email || !password) {
    return res.status(400).send("All fields required");
  }
  // Find user by id
  db.query("SELECT * FROM users WHERE id=?", [id], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).send("User not found");
    }
    const user = result[0];
    // Check password
    const isValid = await bcrypt.compare(password, user.pwd);
    if (!isValid) {
      return res.status(401).send("Incorrect password");
    }
    // Check if username or email is taken by another user
    db.query(
      "SELECT * FROM users WHERE (username=? OR email=?) AND id<>?",
      [username, email, id],
      (err, users) => {
        if (err) return res.status(500).send("Error checking username/email");
        if (users.length > 0) {
          return res.status(409).send("Username or email already in use");
        }
        // Update user
        db.query(
          "UPDATE users SET username=?, email=? WHERE id=?",
          [username, email, id],
          (err) => {
            if (err) return res.status(500).send("Failed to update user");
            // Fetch updated user
            db.query(
              "SELECT id, username, email, role FROM users WHERE id=?",
              [id],
              (err, users) => {
                if (err || users.length === 0) return res.status(500).send("Updated but failed to fetch user");
                // Issue new JWT
                const updatedUser = users[0];
                try {
                  // sendProfileEditEmail(user.email, user.username);
                } catch (err) {
                  console.error('Failed to send profile edit email:', err);
                }
                const token = jwt.sign(
                  { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role },
                  config.JWT_SECRET,
                  { expiresIn: "2h" }
                );
                return res.status(200).json({ ...updatedUser, token });
              }
            );
          }
        );
      }
    );
  });
});

// Change password (self-service, requires old password)
router.put("/changePassword", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  if (!id || !oldPassword || !newPassword) {
    return res.status(400).send("All fields required");
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password does not meet requirements',
      details: passwordValidation.errors 
    });
  }
  db.query("SELECT * FROM users WHERE id=?", [id], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).send("User not found");
    }
    const user = result[0];
    const isValid = await bcrypt.compare(oldPassword, user.pwd);
    if (!isValid) {
      return res.status(401).send("Incorrect old password");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE users SET pwd=? WHERE id=?", [hashed, id], (err) => {
      if (err) return res.status(500).send("Failed to update password");
      try {
        // sendPasswordChangeEmail(user.email, user.username);
      } catch (err) {
        console.error('Failed to send password change email:', err);
      }
      return res.status(200).send("Password updated successfully");
    });
  });
});

// Upload profile photo (base64 string in profile_photo field) or delete photo (when photo is null)
router.post("/uploadProfilePhoto", authenticateToken, (req, res) => {
  const { id, photo } = req.body;
  if (!id) {
    return res.status(400).send("User id required");
  }
  // Only allow authenticated user to update their own photo
  if (!req.user || req.user.id !== id) {
    return res.status(403).send("Not authorized");
  }
  
  // Handle photo deletion (when photo is null)
  if (photo === null) {
    db.query(
      "UPDATE users SET profile_photo=NULL WHERE id=?",
      [id],
      (err, result) => {
        if (err) return res.status(500).send("Failed to delete profile photo");
        if (result.affectedRows === 0) return res.status(404).send("User not found");
        return res.status(200).send("Profile photo deleted");
      }
    );
    return;
  }
  
  // Handle photo upload (when photo is provided)
  if (!photo) {
    return res.status(400).send("Photo data required for upload");
  }
  
  db.query(
    "UPDATE users SET profile_photo=? WHERE id=?",
    [photo, id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to save profile photo");
      if (result.affectedRows === 0) return res.status(404).send("User not found");
      return res.status(200).send("Profile photo updated");
    }
  );
});

// Get profile photo (base64 string) for a user
router.get("/profilePhoto/:id", (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT profile_photo FROM users WHERE id=?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).send("Error fetching profile photo");
      if (!result || result.length === 0) return res.status(404).send("User not found");
      return res.status(200).json({ photo: result[0].profile_photo });
    }
  );
});

module.exports = router; 