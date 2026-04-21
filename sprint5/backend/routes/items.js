// backend/routes/items.js
// Sprint 2 – Inventory Item Management CRUD API

const express = require('express');
const QRCode  = require('qrcode');
const db      = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper: generate item ID in format UH-SCIS-<room_name>-<type>-<seq>
async function generateItemId(room_id, item_type) {
  // Get room name
  const [rooms] = await db.execute('SELECT room_name FROM ROOM WHERE room_id = ?', [room_id]);
  const roomName = rooms[0].room_name.replace(/\s+/g, '');  // Remove spaces

  // Abbreviate item_type
  const typeAbbr = item_type.substring(0, 3).toUpperCase();

  // Count existing items in this room of this type to generate sequence
  const [existing] = await db.execute(
    'SELECT COUNT(*) AS cnt FROM ITEM WHERE room_id = ? AND item_type = ?',
    [room_id, item_type]
  );
  const seq = existing[0].cnt + 1;

  return `UH-SCIS-${roomName}-${typeAbbr}-${seq}`;
}

// Helper: auto-generate QR code for an item
async function autoGenerateQR(item_id, item_name) {
  const qrPayload = JSON.stringify({
    item_id,
    item_name,
    system:    'UniStock',
    generated: new Date().toISOString(),
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 300,
    margin: 2,
    color: { dark: '#2c2825', light: '#ffffff' },
  });

  await db.execute(
    `INSERT INTO QR_CODE (item_id, qr_data)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE qr_data = VALUES(qr_data), generated_at = CURRENT_TIMESTAMP`,
    [item_id, qrDataUrl]
  );

  return qrDataUrl;
}

// GET /api/items – List all items (with optional filters)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { room_id, status, item_type } = req.query;
    let sql = `SELECT i.item_id, i.item_name, i.item_type, i.purchase_date,
                      i.status, i.created_at, i.room_id,
                      r.room_name, r.location_type, r.department
               FROM ITEM i
               JOIN ROOM r ON i.room_id = r.room_id`;

    const conditions = [];
    const params     = [];

    if (room_id)   { conditions.push('i.room_id = ?');   params.push(room_id); }
    if (status)    { conditions.push('i.status = ?');     params.push(status); }
    if (item_type) { conditions.push('i.item_type = ?');  params.push(item_type); }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY i.item_id';

    const [rows] = await db.execute(sql, params);
    return res.json({ items: rows });
  } catch (err) {
    console.error('Get items error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/items/:id – Get single item
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT i.*, r.room_name, r.location_type, r.department
       FROM ITEM i JOIN ROOM r ON i.room_id = r.room_id
       WHERE i.item_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.json({ item: rows[0] });
  } catch (err) {
    console.error('Get item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/items – Create a new item (Admin only)
// Per sequence diagram UC-002: also auto-generates QR code and returns qr_data
router.post('/', requireAuth, requireRole('Admin'), async (req, res) => {
  const { item_name, item_type, room_id, purchase_date } = req.body;

  if (!item_name || !item_type || !room_id) {
    return res.status(400).json({ error: 'item_name, item_type, and room_id are required' });
  }

  try {
    // Verify room exists
    const [rooms] = await db.execute('SELECT room_id FROM ROOM WHERE room_id = ?', [room_id]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Generate item ID in UH-SCIS-<room>-<type>-<seq> format (per class diagram)
    const item_id = await generateItemId(room_id, item_type);

    await db.execute(
      'INSERT INTO ITEM (item_id, room_id, item_name, item_type, purchase_date) VALUES (?, ?, ?, ?, ?)',
      [item_id, room_id, item_name, item_type, purchase_date || null]
    );

    // Auto-generate QR code (per sequence diagram UC-002 & collaboration 2)
    const qr_data = await autoGenerateQR(item_id, item_name);

    return res.status(201).json({
      message: 'Item created',
      item_id,
      qr_data,
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/items/:id – Update an item (Admin only)
router.put('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  const { item_name, item_type, room_id, purchase_date, status } = req.body;

  try {
    const fields = [];
    const values = [];

    if (item_name)     { fields.push('item_name = ?');     values.push(item_name); }
    if (item_type)     { fields.push('item_type = ?');     values.push(item_type); }
    if (room_id)       { fields.push('room_id = ?');       values.push(room_id); }
    if (purchase_date) { fields.push('purchase_date = ?'); values.push(purchase_date); }
    if (status)        { fields.push('status = ?');        values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'At least one field is required to update' });
    }

    values.push(req.params.id);

    const [result] = await db.execute(
      `UPDATE ITEM SET ${fields.join(', ')} WHERE item_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json({ message: 'Item updated' });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/items/:id – Delete an item (Admin only)
router.delete('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    // Remove related verification history first
    const [verRows] = await db.execute('SELECT ver_id FROM VERIFICATION WHERE item_id = ?', [req.params.id]);
    for (const v of verRows) {
      await db.execute('DELETE FROM VER_HISTORY WHERE ver_id = ?', [v.ver_id]);
    }
    await db.execute('DELETE FROM VERIFICATION WHERE item_id = ?', [req.params.id]);

    // Remove related QR codes
    await db.execute('DELETE FROM QR_CODE WHERE item_id = ?', [req.params.id]);

    const [result] = await db.execute(
      'DELETE FROM ITEM WHERE item_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
