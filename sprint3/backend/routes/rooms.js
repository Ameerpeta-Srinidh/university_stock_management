// backend/routes/rooms.js
// Sprint 2 – Room Management CRUD API

const express = require('express');
const db      = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms – List all rooms
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT room_id, room_name, location_type, department, created_at FROM ROOM ORDER BY room_id'
    );
    return res.json({ rooms: rows });
  } catch (err) {
    console.error('Get rooms error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rooms/:id – Get single room
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT room_id, room_name, location_type, department, created_at FROM ROOM WHERE room_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.json({ room: rows[0] });
  } catch (err) {
    console.error('Get room error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/rooms – Create a new room (Admin only)
router.post('/', requireAuth, requireRole('Admin'), async (req, res) => {
  const { room_name, location_type, department } = req.body;

  if (!room_name || !location_type) {
    return res.status(400).json({ error: 'room_name and location_type are required' });
  }

  const validTypes = ['Lab', 'Classroom', 'Cabin', 'Office'];
  if (!validTypes.includes(location_type)) {
    return res.status(400).json({ error: `location_type must be one of: ${validTypes.join(', ')}` });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO ROOM (room_name, location_type, department) VALUES (?, ?, ?)',
      [room_name, location_type, department || null]
    );
    return res.status(201).json({
      message: 'Room created',
      room_id: result.insertId,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A room with that name already exists' });
    }
    console.error('Create room error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/rooms/:id – Update a room (Admin only)
router.put('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  const { room_name, location_type, department } = req.body;

  if (!room_name && !location_type && department === undefined) {
    return res.status(400).json({ error: 'At least one field is required to update' });
  }

  try {
    const fields = [];
    const values = [];

    if (room_name)     { fields.push('room_name = ?');     values.push(room_name); }
    if (location_type) { fields.push('location_type = ?'); values.push(location_type); }
    if (department !== undefined) { fields.push('department = ?'); values.push(department); }

    values.push(req.params.id);

    const [result] = await db.execute(
      `UPDATE ROOM SET ${fields.join(', ')} WHERE room_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json({ message: 'Room updated' });
  } catch (err) {
    console.error('Update room error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/rooms/:id – Delete a room (Admin only)
router.delete('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    // Check if room has items
    const [items] = await db.execute(
      'SELECT COUNT(*) AS cnt FROM ITEM WHERE room_id = ?',
      [req.params.id]
    );
    if (items[0].cnt > 0) {
      return res.status(409).json({ error: 'Cannot delete room that still has items' });
    }

    const [result] = await db.execute(
      'DELETE FROM ROOM WHERE room_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('Delete room error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
