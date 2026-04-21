// backend/routes/verification.js
// Sprint 4 – QR Verification & History API

const express = require('express');
const db      = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/verification/verify – Verify an item via QR scan
router.post('/verify', requireAuth, requireRole('Admin', 'VO'), async (req, res) => {
  const { item_id } = req.body;

  if (!item_id) {
    return res.status(400).json({ error: 'item_id is required' });
  }

  try {
    // Check item exists
    const [items] = await db.execute(
      'SELECT item_id, item_name, status FROM ITEM WHERE item_id = ?',
      [item_id]
    );
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (items[0].status === 'Decommissioned') {
      return res.status(400).json({ error: 'Item is decommissioned – cannot verify' });
    }

    const officer_id = req.session.user.user_id;

    // Insert or update verification record
    const [verResult] = await db.execute(
      `INSERT INTO VERIFICATION (item_id, officer_id, status, ver_date)
       VALUES (?, ?, 'Verified', CURRENT_TIMESTAMP)`,
      [item_id, officer_id]
    );

    // Log to history
    await db.execute(
      `INSERT INTO VER_HISTORY (ver_id, item_id, officer_id, ver_date, notes)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [verResult.insertId, item_id, officer_id, `Verified by ${req.session.user.username}`]
    );

    return res.json({
      message:   'Item verified successfully',
      item_id,
      item_name: items[0].item_name,
      ver_id:    verResult.insertId,
      verified_by: req.session.user.username,
      verified_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/verification/status/:item_id – Get verification status
router.get('/status/:item_id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT v.ver_id, v.item_id, v.status, v.ver_date,
              u.username AS officer_name
       FROM VERIFICATION v
       JOIN USER u ON v.officer_id = u.user_id
       WHERE v.item_id = ?
       ORDER BY v.ver_date DESC
       LIMIT 1`,
      [req.params.item_id]
    );

    if (rows.length === 0) {
      return res.json({ status: 'Never verified', last_verification: null });
    }

    return res.json({
      status:            rows[0].status,
      last_verification: rows[0],
    });
  } catch (err) {
    console.error('Get verification status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/verification/history – Get full verification history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { item_id, limit } = req.query;
    let sql = `SELECT h.history_id, h.item_id, h.ver_date, h.notes,
                      i.item_name, i.item_type,
                      r.room_name,
                      u.username AS officer_name
               FROM VER_HISTORY h
               JOIN ITEM i ON h.item_id = i.item_id
               JOIN ROOM r ON i.room_id = r.room_id
               JOIN USER u ON h.officer_id = u.user_id`;

    const params = [];
    if (item_id) {
      sql += ' WHERE h.item_id = ?';
      params.push(item_id);
    }

    sql += ' ORDER BY h.ver_date DESC';

    if (limit) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const [rows] = await db.execute(sql, params);
    return res.json({ history: rows });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/verification/pending – Get items that haven't been verified recently
router.get('/pending', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT i.item_id, i.item_name, i.item_type, r.room_name,
              MAX(v.ver_date) AS last_verified
       FROM ITEM i
       JOIN ROOM r ON i.room_id = r.room_id
       LEFT JOIN VERIFICATION v ON i.item_id = v.item_id
       WHERE i.status = 'Active'
       GROUP BY i.item_id, i.item_name, i.item_type, r.room_name
       HAVING last_verified IS NULL OR last_verified < DATE_SUB(NOW(), INTERVAL 180 DAY)
       ORDER BY last_verified ASC`
    );
    return res.json({ pending: rows });
  } catch (err) {
    console.error('Get pending error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
