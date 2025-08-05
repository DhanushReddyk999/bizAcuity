const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ✅ added bcrypt for secure passwords
const { v4: uuidv4 } = require('uuid'); // For generating public share/edit IDs
const path = require('path');
const config = require('./config');

const app = express();

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use(cors({
  origin: config.CORS.ORIGIN,
  credentials: config.CORS.CREDENTIALS
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const db = require('./db');

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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

// Import routers
const authRoutes = require('./routes/auth');
const draftRoutes = require('./routes/drafts');
const adminRoutes = require('./routes/admin');
const sharingRoutes = require('./routes/sharing');
const subscriptionsRoutes = require('./routes/subscriptions');
const mailVerificationRoutes = require('./routes/mail-verification');
const adminPlanRoutes = require('./routes/admin_plan');

// API routes
app.use(authRoutes);
app.use(draftRoutes);
app.use('/api/admin', adminRoutes);
app.use(sharingRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/plans', (req, res) => {
  // Handle plans requests - only GET requests
  if (req.method === 'GET') {
    db.query('SELECT * FROM plans', (err, plans) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch plans' });
      res.json(plans);
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});
app.use('/mail-verification', mailVerificationRoutes);
app.use('/api/admin', adminPlanRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/mail-verification') || req.path === '/health') {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server with error handling
const server = app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
  console.log(`Frontend and Backend running on: http://localhost:${config.PORT}`);
  console.log(`Health check available at: http://localhost:${config.PORT}/health`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export db, JWT_SECRET, and authenticateToken for use in route files
module.exports = { db, JWT_SECRET: config.JWT.SECRET, authenticateToken };