// backend/routes/qrcode.js
// Sprint 3 – QR Code Generation API

const express = require('express');
const QRCode  = require('qrcode');
const db      = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/qrcode/generate/:item_id – Generate QR code for an item
router.post('/generate/:item_id', requireAuth, requireRole('Admin'), async (req, res) => {
  const { item_id } = req.params;

  try {
    // Verify item exists
    const [items] = await db.execute('SELECT item_id, item_name FROM ITEM WHERE item_id = ?', [item_id]);
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Create QR data payload
    const qrPayload = JSON.stringify({
      item_id:   items[0].item_id,
      item_name: items[0].item_name,
      system:    'UniStock',
      generated: new Date().toISOString(),
    });

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: { dark: '#2c2825', light: '#ffffff' },
    });

    // Store in DB
    await db.execute(
      `INSERT INTO QR_CODE (item_id, qr_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE qr_data = VALUES(qr_data), generated_at = CURRENT_TIMESTAMP`,
      [item_id, qrDataUrl]
    );

    return res.json({
      message:  'QR code generated',
      item_id,
      qr_data:  qrDataUrl,
    });
  } catch (err) {
    console.error('QR generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/qrcode/:item_id – Get QR code for an item
router.get('/:item_id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT qr_id, item_id, qr_data, generated_at FROM QR_CODE WHERE item_id = ?',
      [req.params.item_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'QR code not found – generate it first' });
    }

    return res.json({ qrcode: rows[0] });
  } catch (err) {
    console.error('Get QR error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/qrcode/bulk – Generate QR codes for multiple items
router.post('/bulk', requireAuth, requireRole('Admin'), async (req, res) => {
  const { item_ids } = req.body;

  if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'item_ids array is required' });
  }

  try {
    const results = [];

    for (const item_id of item_ids) {
      const [items] = await db.execute('SELECT item_id, item_name FROM ITEM WHERE item_id = ?', [item_id]);
      if (items.length === 0) {
        results.push({ item_id, status: 'skipped', reason: 'not found' });
        continue;
      }

      const qrPayload = JSON.stringify({
        item_id:   items[0].item_id,
        item_name: items[0].item_name,
        system:    'UniStock',
        generated: new Date().toISOString(),
      });

      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 300, margin: 2,
        color: { dark: '#2c2825', light: '#ffffff' },
      });

      await db.execute(
        `INSERT INTO QR_CODE (item_id, qr_data)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE qr_data = VALUES(qr_data), generated_at = CURRENT_TIMESTAMP`,
        [item_id, qrDataUrl]
      );

      results.push({ item_id, status: 'generated' });
    }

    return res.json({ message: 'Bulk QR generation complete', results });
  } catch (err) {
    console.error('Bulk QR error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
