// backend/seed.js
// Sprint 1 – Seed test users with bcrypt-hashed passwords

const bcrypt = require('bcrypt');
const db     = require('./config/db');

const SALT_ROUNDS = 10;

const users = [
  { username: 'admin',    password: 'admin123',    role: 'Admin' },
  { username: 'officer1', password: 'officer123',  role: 'VO'    },
];

async function seed() {
  console.log(' Seeding users...');
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await db.execute(
      `INSERT INTO USER (username, password_hash, role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
      [u.username, hash, u.role]
    );
    console.log(` ${u.username} (${u.role})`);
  }
  console.log('Done.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
