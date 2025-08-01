const express = require('express');
const router = express.Router();
const db = require('../db');



// Start free trial
router.post('/start-free-trial', (req, res) => {
  const { userId } = req.body;
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  // Find the free plan's id
  db.query('SELECT id FROM plans WHERE LOWER(name) = "free"', (err, planResults) => {
    if (err || !planResults || planResults.length === 0) {
      return res.status(500).json({ success: false, error: 'Free plan not found' });
    }
    const freePlanId = planResults[0].id;
    db.query(
      'UPDATE users SET plan_id = ?, subscription_expires = ? WHERE id = ?',
      [freePlanId, expires, userId],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, plan_id: freePlanId, expires });
      }
    );
  });
});

// Purchase premium
router.post('/purchase-premium', (req, res) => {
  const { userId, duration } = req.body; // duration: 'monthly' or 'yearly'
  let expires;
  if (duration === 'monthly') {
    expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  } else {
    expires = Date.now() + 365 * 24 * 60 * 60 * 1000;
  }
  // Find the premium plan's id
  db.query('SELECT id FROM plans WHERE LOWER(name) = "premium"', (err, planResults) => {
    if (err || !planResults || planResults.length === 0) {
      return res.status(500).json({ success: false, error: 'Premium plan not found' });
    }
    const premiumPlanId = planResults[0].id;
    db.query(
      'UPDATE users SET plan_id = ?, subscription_expires = ? WHERE id = ?',
      [premiumPlanId, expires, userId],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, plan_id: premiumPlanId, expires });
      }
    );
  });
});

// Purchase a plan (generic)
router.post('/purchase', (req, res) => {
  const { userId, planId } = req.body;
  if (!userId || !planId) {
    return res.status(400).json({ success: false, error: 'userId and planId are required' });
  }
  // Fetch plan duration from plans table
  db.query('SELECT duration FROM plans WHERE id=?', [planId], (err, planResults) => {
    if (err || !planResults || planResults.length === 0) {
      return res.status(500).json({ success: false, error: 'Plan not found' });
    }
    const duration = (planResults[0].duration || '').toLowerCase();
    let expires;
    if (duration.includes('month')) {
      expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
    } else if (duration.includes('year')) {
      expires = Date.now() + 365 * 24 * 60 * 60 * 1000;
    } else if (duration.includes('week')) {
      expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    } else {
      // Default to 30 days
      expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
    }
    db.query(
      'UPDATE users SET plan_id = ?, subscription_expires = ? WHERE id = ?',
      [planId, expires, userId],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, plan_id: planId, expires });
      }
    );
  });
});

// Cancel subscription
router.post('/cancel', (req, res) => {
  const { userId } = req.body;
  // Find the free plan's id
  db.query('SELECT id FROM plans WHERE LOWER(name) = "free"', (err, planResults) => {
    if (err || !planResults || planResults.length === 0) {
      return res.status(500).json({ success: false, error: 'Free plan not found' });
    }
    const freePlanId = planResults[0].id;
    db.query(
      'UPDATE users SET plan_id = ?, subscription_expires = NULL WHERE id = ?',
      [freePlanId, userId],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, plan_id: freePlanId, expires: null });
      }
    );
  });
});

// Get subscription status
router.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT users.plan_id, users.subscription_expires AS expires, plans.name AS plan
     FROM users LEFT JOIN plans ON users.plan_id = plans.id WHERE users.id = ?`,
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!results || results.length === 0) return res.json({ plan: 'none' });
      const response = { plan: results[0].plan, plan_id: results[0].plan_id, expires: results[0].expires };
      res.json(response);
    }
  );
});

module.exports = router; 