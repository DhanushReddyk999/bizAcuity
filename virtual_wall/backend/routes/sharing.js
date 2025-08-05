const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Enable public sharing for a draft (returns shareable link)
router.post("/shareDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  const public_share_id = uuidv4();
  db.query(
    "UPDATE walls SET public_share_id=?, is_public=1 WHERE wall_id=?",
    [public_share_id, wall_id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to enable sharing");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      return res.status(200).json({ shareUrl: `${config.FRONTEND_URL}/shared/${public_share_id}` });
    }
  );
});

// Public endpoint to fetch a shared draft (no auth)
router.get("/publicDraft/:shareId", (req, res) => {
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
router.post("/editShareDraft/:id", (req, res) => {
  const wall_id = req.params.id;
  const public_edit_id = uuidv4();
  db.query(
    "UPDATE walls SET public_edit_id=? WHERE wall_id=?",
    [public_edit_id, wall_id],
    (err, result) => {
      if (err) return res.status(500).send("Failed to enable edit sharing");
      if (result.affectedRows === 0) return res.status(404).send("Draft not found");
      return res.status(200).json({ editUrl: `${config.FRONTEND_URL}/edit-shared/${public_edit_id}` });
    }
  );
});

// Fetch a draft for editing by public_edit_id (requires login)
router.get("/editSharedDraft/:editId", authenticateToken, (req, res) => {
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
router.put("/editSharedDraft/:editId", authenticateToken, (req, res) => {
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
router.post("/authViewShareDraft/:id", (req, res) => {
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
      return res.status(200).json({ viewUrl: `${config.FRONTEND_URL}/auth-view/${authorized_view_id}` });
    }
  );
});

// Fetch invite-only view draft (requires login, checks email)
router.get("/authViewDraft/:viewId", authenticateToken, (req, res) => {
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
router.post("/authEditShareDraft/:id", (req, res) => {
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
      return res.status(200).json({ editUrl: `${config.FRONTEND_URL}/auth-edit/${authorized_edit_id}` });
    }
  );
});

// Fetch invite-only edit draft (requires login, checks email)
router.get("/authEditDraft/:editId", authenticateToken, (req, res) => {
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
router.put("/authEditDraft/:editId", authenticateToken, (req, res) => {
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

module.exports = router; 