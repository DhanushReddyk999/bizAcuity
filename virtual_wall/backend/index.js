const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ✅ added bcrypt for secure passwords
const { v4: uuidv4 } = require('uuid'); // For generating public share/edit IDs
const JWT_SECRET = "your_jwt_secret_key_here"; // ✅ use env in production

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "bizacuity",
  password: "Dhanush@12032006",
  multipleStatements: true,
});

app.listen(8080, () => {
  console.log("server started");
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database");
});

// ✅ JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access denied. No token provided.");
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token.");
    req.user = user;
    next();
  });
}

// ✅ SIGN UP — now hashes password before storing
app.post("/SignUp", async (req, res) => {
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

// ✅ LOGIN — securely compares hashed passwords
app.post("/Login", async (req, res) => {
  const { username, password } = req.body;
  let q = `SELECT * FROM users WHERE username = ?`;

  db.query(q, [username], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).send("User doesn't exist");
    }

    const user = result[0];

    // ✅ Securely compare password
    const isValid = await bcrypt.compare(password, user.pwd);
    if (!isValid) {
      return res.status(401).send("Invalid password");
    }

    // ✅ Create JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
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

// Enable public sharing for a draft (returns shareable link)
app.post("/shareDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  const public_share_id = uuidv4();
  // Set is_public=1 and assign a new public_share_id
  db.query(
    "UPDATE walls SET public_share_id=?, is_public=1 WHERE wall_id=?",
    [public_share_id, wall_id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to enable sharing");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      // Return the shareable URL
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.status(200).json({ shareUrl: `${frontendUrl}/shared/${public_share_id}` });
    }
  );
});

// Public endpoint to fetch a shared draft (no auth)
app.get("/publicDraft/:shareId", (req, res) => {
  const shareId = req.params.shareId;
  db.query(
    "SELECT * FROM walls WHERE public_share_id=? AND is_public=1",
    [shareId],
    (err, result) => {
      if (err) return res.status(500).send("Error fetching shared draft");
      if (!result || result.length === 0) return res.status(404).send("Draft not found or not public");
      return res.status(200).json(result[0]);
    }
  );
});

// Enable edit sharing for a draft (returns edit link)
app.post("/editShareDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  const public_edit_id = uuidv4();
  db.query(
    "UPDATE walls SET public_edit_id=? WHERE wall_id=?",
    [public_edit_id, wall_id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to enable edit sharing");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.status(200).json({ editUrl: `${frontendUrl}/edit-shared/${public_edit_id}` });
    }
  );
});

// Fetch a draft for editing by public_edit_id (requires login)
app.get("/editSharedDraft/:editId", authenticateToken, (req, res) => {
  const editId = req.params.editId;
  db.query(
    "SELECT * FROM walls WHERE public_edit_id=?",
    [editId],
    (err, result) => {
      if (err) return res.status(500).send("Error fetching shared draft for edit");
      if (!result || result.length === 0) return res.status(404).send("Draft not found");
      return res.status(200).json(result[0]);
    }
  );
});

// Update a draft by public_edit_id (requires login)
app.put("/editSharedDraft/:editId", authenticateToken, (req, res) => {
  const editId = req.params.editId;
  const { wall_data, timestamp, wall_name } = req.body;
  db.query(
    "UPDATE walls SET wall_data=?, timestamp=?, wall_name=? WHERE public_edit_id=?",
    [wall_data, timestamp, wall_name, editId],
    (err, result) => {
      if (err) return res.status(500).send("Failed to update draft");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      return res.status(200).send("Draft updated successfully");
    }
  );
});

// Generate invite-only view link for specified emails
app.post("/authViewShareDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  const { emails } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).send("Emails are required");
  }
  const authorized_view_id = uuidv4();
  const emailsJson = JSON.stringify(emails);
  db.query(
    "UPDATE walls SET authorized_view_id=?, authorized_view_emails=? WHERE wall_id=?",
    [authorized_view_id, emailsJson, wall_id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to enable authorized view sharing");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.status(200).json({ viewUrl: `${frontendUrl}/auth-view/${authorized_view_id}` });
    }
  );
});

// Fetch invite-only view draft (requires login, checks email)
app.get("/authViewDraft/:viewId", authenticateToken, (req, res) => {
  const viewId = req.params.viewId;
  const userEmail = req.user?.email;
  db.query(
    "SELECT * FROM walls WHERE authorized_view_id=?",
    [viewId],
    (err, result) => {
      if (err) return res.status(500).send("Error fetching authorized view draft");
      if (!result || result.length === 0) return res.status(404).send("Draft not found");
      const draft = result[0];
      let allowedEmails = [];
      try {
        allowedEmails = JSON.parse(draft.authorized_view_emails || "[]");
      } catch (e) {}
      if (!allowedEmails.includes(userEmail)) {
        return res.status(403).send("Not authorized to view this draft");
      }
      return res.status(200).json(draft);
    }
  );
});

// Generate invite-only edit link for specified emails
app.post("/authEditShareDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  const { emails } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).send("Emails are required");
  }
  const authorized_edit_id = uuidv4();
  const emailsJson = JSON.stringify(emails);
  db.query(
    "UPDATE walls SET authorized_edit_id=?, authorized_edit_emails=? WHERE wall_id=?",
    [authorized_edit_id, emailsJson, wall_id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to enable authorized edit sharing");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.status(200).json({ editUrl: `${frontendUrl}/auth-edit/${authorized_edit_id}` });
    }
  );
});

// Fetch invite-only edit draft (requires login, checks email)
app.get("/authEditDraft/:editId", authenticateToken, (req, res) => {
  const editId = req.params.editId;
  const userEmail = req.user?.email;
  db.query(
    "SELECT * FROM walls WHERE authorized_edit_id=?",
    [editId],
    (err, result) => {
      if (err) return res.status(500).send("Error fetching authorized edit draft");
      if (!result || result.length === 0) return res.status(404).send("Draft not found");
      const draft = result[0];
      let allowedEmails = [];
      try {
        allowedEmails = JSON.parse(draft.authorized_edit_emails || "[]");
      } catch (e) {}
      if (!allowedEmails.map(e => e.toLowerCase().trim()).includes(userEmail.toLowerCase().trim())) {
        return res.status(403).send("Not authorized to edit this draft");
      }
      return res.status(200).json(draft);
    }
  );
});

// Update invite-only edit draft (requires login, checks email)
app.put("/authEditDraft/:editId", authenticateToken, (req, res) => {
  const editId = req.params.editId;
  const userEmail = req.user?.email;
  const { wall_data, timestamp, wall_name } = req.body;
  db.query(
    "SELECT authorized_edit_emails FROM walls WHERE authorized_edit_id=?",
    [editId],
    (err, result) => {
      if (err || !result || result.length === 0) return res.status(404).send("Draft not found");
      let allowedEmails = [];
      try {
        allowedEmails = JSON.parse(result[0].authorized_edit_emails || "[]");
      } catch (e) {}
      if (!allowedEmails.map(e => e.toLowerCase().trim()).includes(userEmail.toLowerCase().trim())) {
        return res.status(403).send("Not authorized to edit this draft");
      }
      db.query(
        "UPDATE walls SET wall_data=?, timestamp=?, wall_name=? WHERE authorized_edit_id=?",
        [wall_data, timestamp, wall_name, editId],
        (err2, result2) => {
          if (err2) return res.status(500).send("Failed to update draft");
          if (result2.affectedRows === 0) return res.status(404).send("Draft not found");
          return res.status(200).send("Draft updated successfully");
        }
      );
    }
  );
});

// ✅ All routes below this are protected
app.use(authenticateToken);

// Save or update draft
app.post("/saveDrafts", (req, res) => {
  let { uid, wall_data, timestamp, wall_name, wall_id } = req.body;
  if (wall_id) {
    // Update existing draft
    let q = `UPDATE walls SET wall_data=?, timestamp=?, wall_name=? WHERE wall_id=? AND uid=?`;
    let data = [wall_data, timestamp, wall_name, wall_id, uid];
    db.query(q, data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("cannot update the draft");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Draft not found or not owned by user");
      }
      return res.status(200).send("draft updated");
    });
  } else {
    // Insert new draft
    let q = `INSERT INTO walls(wall_data, timestamp, uid, wall_name) values(?,?,?,?)`;
    let data = [wall_data, timestamp, uid, wall_name];
    db.query(q, data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("cannot save the draft");
      }
      return res.status(201).send("draft saved");
    });
  }
});

// Get all drafts of user
app.get("/getDrafts/:id", (req, res) => {
  const uid = req.params.id;
  let q = `SELECT * FROM walls WHERE uid = ?`;
  db.query(q, [uid], (err, results) => {
    if (err) return res.status(500).send("Error fetching drafts");
    return res.status(200).json(results);
  });
});

// Delete draft by ID
app.delete("/deleteDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  let q = `DELETE FROM walls WHERE wall_id=?`;
  db.query(q, [wall_id], (err, result) => {
    if (err) return res.status(500).send("error in deleting draft");
    if (result.affectedRows === 0)
      return res.status(404).send("Draft not found");
    return res.status(201).send("deleted draft successfully");
  });
});

// ✅ DELETE USER — now checks bcrypt before deleting
app.delete("/deleteUser", async (req, res) => {
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
        return res.status(200).send("User deleted successfully");
      });
    });
  });
});

// Delete a user by id (admin only, requires admin password)
app.delete("/admin/user/:id", async (req, res) => {
  const { adminUsername, adminPassword } = req.body;
  const userId = req.params.id;
  if (!adminUsername || !adminPassword) {
    return res.status(400).send("Admin username and password required");
  }
  // Verify admin credentials
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
    // Delete the user
    db.query("DELETE FROM users WHERE id=?", [userId], (err, result) => {
      if (err) return res.status(500).send("Failed to delete user");
      if (result.affectedRows === 0) return res.status(404).send("User not found");
      return res.status(200).send("User deleted successfully");
    });
  });
});

// Update a user by id (admin only, requires admin password)
app.put("/admin/user/:id", async (req, res) => {
  const { username, email, role, adminUsername, adminPassword } = req.body;
  const userId = req.params.id;
  if (!username || !email || !role || !adminUsername || !adminPassword) {
    return res.status(400).send("Username, email, role, admin username, and admin password are required");
  }
  // Verify admin credentials
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
    // Update the user
    db.query(
      "UPDATE users SET username=?, email=?, role=? WHERE id=?",
      [username, email, role, userId],
      (err, result) => {
        if (err) return res.status(500).send("Failed to update user");
        if (result.affectedRows === 0) return res.status(404).send("User not found");
        return res.status(200).send("User updated successfully");
      }
    );
  });
});

// Get all users (admin only)
app.get("/admin/users", (req, res) => {
  // Optionally, check req.user.role === 'admin' for extra security
  db.query("SELECT id, username, email, role FROM users", (err, results) => {
    if (err) return res.status(500).send("Error fetching users");
    return res.status(200).json(results);
  });
});

// Add a new user (admin only, requires admin credentials)
app.post("/admin/user", async (req, res) => {
  const { username, email, role, password, adminUsername, adminPassword } = req.body;
  if (!username || !email || !role || !password || !adminUsername) {
    return res.status(400).send("All fields are required");
  }
  // If adminPassword is provided, verify admin credentials
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
      // Continue to add user
      addUser();
    });
  } else {
    // If no adminPassword, just check role from JWT (already authenticated)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Not authorized");
    }
    addUser();
  }

  async function addUser() {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      let q = `INSERT INTO users(username,email,pwd,role) values(?)`;
      let data = [username, email, hashedPassword, role];
      db.query(q, [data], (err, result) => {
        if (err) {
          return res.status(500).send("User already exists or error adding user");
        }
        // Return the new user (without password)
        db.query("SELECT id, username, email, role FROM users WHERE username=?", [username], (err, users) => {
          if (err || users.length === 0) return res.status(500).send("User added but failed to fetch");
          return res.status(201).json(users[0]);
        });
      });
    } catch (err) {
      return res.status(500).send("Error adding user");
    }
  }
});

// Get all drafts (admin only)
app.get("/admin/drafts", (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Not authorized");
  }
  db.query("SELECT * FROM walls", (err, results) => {
    if (err) return res.status(500).send("Error fetching drafts");
    return res.status(200).json(results);
  });
});

// Get a single user by id (admin only)
app.get("/admin/user/:id", (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Not authorized");
  }
  const userId = req.params.id;
  db.query("SELECT id, username, email, role FROM users WHERE id=?", [userId], (err, results) => {
    if (err) return res.status(500).send("Error fetching user");
    if (results.length === 0) return res.status(404).send("User not found");
    return res.status(200).json(results[0]);
  });
});

// ✅ Update user (self-service, requires password)
app.put("/updateUser", async (req, res) => {
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
                const token = jwt.sign(
                  { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role },
                  JWT_SECRET,
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

// ✅ Change password (self-service, requires old password)
app.put("/changePassword", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  if (!id || !oldPassword || !newPassword) {
    return res.status(400).send("All fields required");
  }
  if (newPassword.length < 6) {
    return res.status(400).send("New password must be at least 6 characters");
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
      return res.status(200).send("Password updated successfully");
    });
  });
});

// ✅ Upload profile photo (base64 string in profile_photo field)
app.post("/uploadProfilePhoto", (req, res) => {
  const { id, photo } = req.body;
  if (!id || !photo) {
    return res.status(400).send("User id and photo required");
  }
  // Only allow authenticated user to update their own photo
  if (!req.user || req.user.id !== id) {
    return res.status(403).send("Not authorized");
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

// ✅ Get profile photo (base64 string) for a user
app.get("/profilePhoto/:id", (req, res) => {
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