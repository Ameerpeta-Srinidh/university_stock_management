// backend/server.js
// Sprint 5 – Express server (final version – all routes)

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const authRoutes         = require('./routes/auth');
const roomRoutes         = require('./routes/rooms');
const itemRoutes         = require('./routes/items');
const qrcodeRoutes       = require('./routes/qrcode');
const verificationRoutes = require('./routes/verification');
const reportRoutes       = require('./routes/reports');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,             
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   Number(process.env.SESSION_MAX_AGE) || 3_600_000,
  },
}));

app.use('/api/auth',         authRoutes);
app.use('/api/rooms',        roomRoutes);
app.use('/api/items',        itemRoutes);
app.use('/api/qrcode',       qrcodeRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reports',      reportRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app; 
