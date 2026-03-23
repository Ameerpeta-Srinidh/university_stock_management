// backend/routes/auth.js
// Sprint 1 – Login / Logout API endpoints

const express = require('express');
const bcrypt  = require('bcrypt');
const db      = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT user_id, username, password_hash, role FROM USER WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    } 
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
 
      req.session.user = {
        user_id:  user.user_id,
        username: user.username,
        role:     user.role,
      };

      return res.json({
        message: 'Login successful',
        user: req.session.user,
      });
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.session.user });
});

module.exports = router;
