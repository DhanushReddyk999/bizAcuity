const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../index');

// Save or update draft
router.post("/saveDrafts", authenticateToken, (req, res) => {
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
    // Check user's plan_id and draft count
    db.query('SELECT plan_id FROM users WHERE id=?', [uid], (err, userResults) => {
      if (err || !userResults || userResults.length === 0) {
        return res.status(500).send("Cannot verify user plan");
      }
      const plan_id = userResults[0].plan_id;
      if (!plan_id) {
        return res.status(403).send("No plan assigned. Please subscribe to a plan.");
      }
      db.query('SELECT max_drafts FROM plans WHERE id=?', [plan_id], (err2, planResults) => {
        if (err2 || !planResults || planResults.length === 0) {
          return res.status(500).send("Cannot fetch plan details");
        }
        const maxDrafts = planResults[0].max_drafts;
        db.query('SELECT COUNT(*) AS draftCount FROM walls WHERE uid=?', [uid], (err3, countResults) => {
          if (err3) return res.status(500).send("Cannot count drafts");
        const draftCount = countResults[0].draftCount;
          if (maxDrafts !== null && maxDrafts !== undefined && draftCount >= maxDrafts) {
            return res.status(403).send(`Your plan allows only ${maxDrafts} drafts. Upgrade your plan to save more drafts.`);
        }
        let q = `INSERT INTO walls(wall_data, timestamp, uid, wall_name) values(?,?,?,?)`;
        let data = [wall_data, timestamp, uid, wall_name];
        db.query(q, data, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send("cannot save the draft");
          }
          return res.status(201).send("draft saved");
          });
        });
      });
    });
  }
});

// Get all drafts of user
router.get("/getDrafts/:id", authenticateToken, (req, res) => {
  const uid = req.params.id;
  let q = `SELECT * FROM walls WHERE uid = ?`;
  db.query(q, [uid], (err, results) => {
    if (err) return res.status(500).send("Error fetching drafts");
    return res.status(200).json(results);
  });
});

// Delete draft by ID
router.delete("/deleteDraft/:id", authenticateToken, (req, res) => {
  const wall_id = req.params.id;
  let q = `DELETE FROM walls WHERE wall_id=?`;
  db.query(q, [wall_id], (err, result) => {
    if (err) return res.status(500).send("error in deleting draft");
    if (result.affectedRows === 0)
      return res.status(404).send("Draft not found");
    return res.status(201).send("deleted draft successfully");
  });
});

module.exports = router; 