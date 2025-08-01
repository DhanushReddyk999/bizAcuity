const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ✅ added bcrypt for secure passwords
const { v4: uuidv4 } = require('uuid'); // For generating public share/edit IDs
const config = require('./config');

const app = express();
app.use(cors({
  origin: config.CORS.ORIGIN,
  credentials: config.CORS.CREDENTIALS
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const db = require('./db');

app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});

// ✅ JWT middleware
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

// Export db, JWT_SECRET, and authenticateToken for use in route files
module.exports = { db, JWT_SECRET: config.JWT.SECRET, authenticateToken };

// Import routers
const authRoutes = require('./routes/auth');
const draftRoutes = require('./routes/drafts');
const adminRoutes = require('./routes/admin');
const sharingRoutes = require('./routes/sharing');
const subscriptionsRoutes = require('./routes/subscriptions');
const mailVerificationRoutes = require('./routes/mail-verification');
const adminPlanRoutes = require('./routes/admin_plan');
app.use(authRoutes);
app.use(draftRoutes);
app.use(adminRoutes);
app.use(sharingRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/plans', (req, res) => {
  // Handle plans requests
  db.query('SELECT * FROM plans', (err, plans) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch plans' });
    res.json(plans);
  });
});
app.use('/mail-verification', mailVerificationRoutes);
app.use(adminPlanRoutes);