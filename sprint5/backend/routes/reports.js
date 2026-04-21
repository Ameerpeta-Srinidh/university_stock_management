// backend/routes/reports.js
// Sprint 5 – Reporting & Analytics API

const express = require('express');
const db      = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/summary – Dashboard summary stats
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const [roomCount]     = await db.execute('SELECT COUNT(*) AS count FROM ROOM');
    const [itemCount]     = await db.execute('SELECT COUNT(*) AS count FROM ITEM');
    const [activeCount]   = await db.execute("SELECT COUNT(*) AS count FROM ITEM WHERE status = 'Active'");
    const [decomCount]    = await db.execute("SELECT COUNT(*) AS count FROM ITEM WHERE status = 'Decommissioned'");
    const [verifiedCount] = await db.execute("SELECT COUNT(DISTINCT item_id) AS count FROM VERIFICATION WHERE status = 'Verified'");
    const [qrCount]       = await db.execute('SELECT COUNT(*) AS count FROM QR_CODE');

    return res.json({
      summary: {
        total_rooms:        roomCount[0][0].count,
        total_items:        itemCount[0][0].count,
        active_items:       activeCount[0][0].count,
        decommissioned:     decomCount[0][0].count,
        verified_items:     verifiedCount[0][0].count,
        qr_codes_generated: qrCount[0][0].count,
      },
    });
  } catch (err) {
    console.error('Report summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/by-room – Items grouped by room
router.get('/by-room', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.room_id, r.room_name, r.location_type, r.department,
              COUNT(i.item_id) AS item_count,
              SUM(CASE WHEN i.status = 'Active' THEN 1 ELSE 0 END) AS active_count,
              SUM(CASE WHEN i.status = 'Decommissioned' THEN 1 ELSE 0 END) AS decom_count
       FROM ROOM r
       LEFT JOIN ITEM i ON r.room_id = i.room_id
       GROUP BY r.room_id, r.room_name, r.location_type, r.department
       ORDER BY r.room_name`
    );
    return res.json({ rooms: rows });
  } catch (err) {
    console.error('Report by-room error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/by-type – Items grouped by type
router.get('/by-type', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT item_type, COUNT(*) AS count
       FROM ITEM
       GROUP BY item_type
       ORDER BY count DESC`
    );
    return res.json({ types: rows });
  } catch (err) {
    console.error('Report by-type error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/verification-overview – Verification stats
router.get('/verification-overview', requireAuth, async (req, res) => {
  try {
    const [totalItems]    = await db.execute("SELECT COUNT(*) AS count FROM ITEM WHERE status = 'Active'");
    const [verifiedItems] = await db.execute(
      `SELECT COUNT(DISTINCT item_id) AS count FROM VERIFICATION WHERE status = 'Verified'`
    );
    const [recentVer]     = await db.execute(
      `SELECT v.item_id, i.item_name, v.ver_date, u.username AS officer
       FROM VERIFICATION v
       JOIN ITEM i ON v.item_id = i.item_id
       JOIN USER u ON v.officer_id = u.user_id
       ORDER BY v.ver_date DESC
       LIMIT 10`
    );

    const total    = totalItems[0][0].count;
    const verified = verifiedItems[0][0].count;

    return res.json({
      overview: {
        total_active:    total,
        verified:        verified,
        pending:         total - verified,
        completion_pct:  total > 0 ? Math.round((verified / total) * 100) : 0,
        recent:          recentVer[0],
      },
    });
  } catch (err) {
    console.error('Verification overview error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/export – Export items as JSON (CSV-ready)
router.get('/export', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT i.item_id, i.item_name, i.item_type, i.purchase_date, i.status,
              r.room_name, r.location_type, r.department,
              MAX(v.ver_date) AS last_verified,
              MAX(v.status) AS ver_status
       FROM ITEM i
       JOIN ROOM r ON i.room_id = r.room_id
       LEFT JOIN VERIFICATION v ON i.item_id = v.item_id
       GROUP BY i.item_id, i.item_name, i.item_type, i.purchase_date, i.status,
                r.room_name, r.location_type, r.department
       ORDER BY i.item_id`
    );
    return res.json({ export: rows, count: rows.length });
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
