// backend/routes/admin.js
// Sprint 5 – Admin User Management API (per class diagram AdminPage)

const express = require('express');
const bcrypt  = require('bcrypt');
const db      = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users – List all users (Admin only)
router.get('/users', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT user_id, username, role, created_at FROM USER ORDER BY user_id'
    );
    return res.json({ users: rows });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users – Add a new user (Admin only)
// Per class diagram AdminPage.addUser()
router.post('/users', requireAuth, requireRole('Admin'), async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' });
  }

  const validRoles = ['Admin', 'VO'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO USER (username, password_hash, role) VALUES (?, ?, ?)',
      [username, password_hash, role]
    );

    return res.status(201).json({
      message: 'User created',
      user_id: result.insertId,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id – Delete a user (Admin only)
router.delete('/users/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  const userId = req.params.id;

  // Prevent self-deletion
  if (parseInt(userId) === req.session.user.user_id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM USER WHERE user_id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/activity-log – Get recent activity log (Admin only)
// Per class diagram AdminPage.renderLog()
router.get('/activity-log', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT h.history_id, h.item_id, h.ver_date, h.notes,
              i.item_name, u.username AS officer_name
       FROM VER_HISTORY h
       JOIN ITEM i ON h.item_id = i.item_id
       JOIN USER u ON h.officer_id = u.user_id
       ORDER BY h.ver_date DESC
       LIMIT 50`
    );
    return res.json({ log: rows });
  } catch (err) {
    console.error('Activity log error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
