const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../index');

// GET /plans - fetch all plans (no join, just return all columns)
router.get('/plans', authenticateToken, (req, res) => {
  db.query('SELECT * FROM plans', (err, plans) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch plans' });
    res.json(plans);
  });
});

// Create a new plan
router.post('/plans', authenticateToken, (req, res) => {
  const { name, price, duration } = req.body;
  db.query('INSERT INTO plans (name, price, duration) VALUES (?, ?, ?)', [name, price, duration], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create plan' });
    res.json({ success: true, id: result.insertId });
  });
});

// Update a plan
router.put('/plans/:id', authenticateToken, (req, res) => {
  const { name, price, duration } = req.body;
  db.query('UPDATE plans SET name=?, price=?, duration=? WHERE id=?', [name, price, duration, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update plan' });
    res.json({ success: true });
  });
});

// Update max_drafts for a plan
router.put('/plans/:id/max-drafts', authenticateToken, (req, res) => {
  const { maxDrafts } = req.body;
  db.query('UPDATE plans SET max_drafts=? WHERE id=?', [maxDrafts, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update max drafts' });
    res.json({ success: true });
  });
});

// Update sticker limit for a plan (single column)
router.put('/plans/:id/sticker-limit', authenticateToken, (req, res) => {
  const { stickers_limit } = req.body;
  db.query('UPDATE plans SET stickers_limit=? WHERE id=?', [stickers_limit, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update sticker limit' });
    res.json({ success: true });
  });
});

// Update share toggles for a plan
router.put('/plans/:id/share-toggles', authenticateToken, (req, res) => {
  const {
    share_authorized_view_enabled,
    share_authorized_edit_enabled,
    share_unauthorized_view_enabled,
    share_unauthorized_edit_enabled,
  } = req.body;
  db.query(
    `UPDATE plans SET
      share_authorized_view_enabled=?,
      share_authorized_edit_enabled=?,
      share_unauthorized_view_enabled=?,
      share_unauthorized_edit_enabled=?
    WHERE id=?`,
    [
      share_authorized_view_enabled ? 1 : 0,
      share_authorized_edit_enabled ? 1 : 0,
      share_unauthorized_view_enabled ? 1 : 0,
      share_unauthorized_edit_enabled ? 1 : 0,
      req.params.id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update share toggles' });
      res.json({ success: true });
    }
  );
});

// Update feature toggles for a plan
router.put('/plans/:id/feature-toggles', authenticateToken, (req, res) => {
  const {
    download_wall_enabled,
    custom_bg_enabled,
    upload_image_enabled,
  } = req.body;
  db.query(
    `UPDATE plans SET
      download_wall_enabled=?,
      custom_bg_enabled=?,
      upload_image_enabled=?
    WHERE id=?`,
    [
      download_wall_enabled ? 1 : 0,
      custom_bg_enabled ? 1 : 0,
      upload_image_enabled ? 1 : 0,
      req.params.id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update feature toggles' });
      res.json({ success: true });
    }
  );
});

// Delete a plan
router.delete('/plans/:id', authenticateToken, (req, res) => {
  db.query('DELETE FROM plans WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete plan' });
    res.json({ success: true });
  });
});



module.exports = router; 