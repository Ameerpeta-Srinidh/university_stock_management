// backend/seed.js
// Sprint 2 – Seed test users + sample rooms & items

const bcrypt = require('bcrypt');
const db     = require('./config/db');

const SALT_ROUNDS = 10;

const users = [
  { username: 'admin',    password: 'admin123',    role: 'Admin' },
  { username: 'officer1', password: 'officer123',  role: 'VO'    },
];

const rooms = [
  { room_name: 'Lab 101',         location_type: 'Lab',       department: 'Computer Science' },
  { room_name: 'Lab 102',         location_type: 'Lab',       department: 'Computer Science' },
  { room_name: 'Classroom 201',   location_type: 'Classroom', department: 'Computer Science' },
  { room_name: 'Prof. Rao Cabin', location_type: 'Cabin',     department: 'Computer Science' },
  { room_name: 'Admin Office',    location_type: 'Office',    department: 'Administration'   },
];

const items = [
  { item_id: 'ITEM-001', room_idx: 0, item_name: 'Dell Desktop PC',   item_type: 'Desktop',   purchase_date: '2024-06-15' },
  { item_id: 'ITEM-002', room_idx: 0, item_name: 'HP Monitor 24"',    item_type: 'Monitor',   purchase_date: '2024-06-15' },
  { item_id: 'ITEM-003', room_idx: 0, item_name: 'Logitech Keyboard', item_type: 'Keyboard',  purchase_date: '2024-07-01' },
  { item_id: 'ITEM-004', room_idx: 1, item_name: 'Lenovo Desktop PC', item_type: 'Desktop',   purchase_date: '2024-08-20' },
  { item_id: 'ITEM-005', room_idx: 2, item_name: 'Epson Projector',   item_type: 'Projector', purchase_date: '2024-09-10' },
  { item_id: 'ITEM-006', room_idx: 3, item_name: 'Office Chair',      item_type: 'Chair',     purchase_date: '2023-03-01' },
  { item_id: 'ITEM-007', room_idx: 4, item_name: 'Canon Printer',     item_type: 'Printer',   purchase_date: '2024-01-12' },
];

async function seed() {
  console.log('🌱 Seeding users...');
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await db.execute(
      `INSERT INTO USER (username, password_hash, role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
      [u.username, hash, u.role]
    );
    console.log(` ✓ ${u.username} (${u.role})`);
  }

  console.log('🌱 Seeding rooms...');
  const roomIds = [];
  for (const r of rooms) {
    const [result] = await db.execute(
      `INSERT INTO ROOM (room_name, location_type, department)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE room_name = VALUES(room_name)`,
      [r.room_name, r.location_type, r.department]
    );
    roomIds.push(result.insertId || result.insertId);
    console.log(` ✓ ${r.room_name}`);
  }

  console.log('🌱 Seeding items...');
  for (const item of items) {
    await db.execute(
      `INSERT INTO ITEM (item_id, room_id, item_name, item_type, purchase_date)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE item_name = VALUES(item_name)`,
      [item.item_id, item.room_idx + 1, item.item_name, item.item_type, item.purchase_date]
    );
    console.log(` ✓ ${item.item_id} – ${item.item_name}`);
  }

  console.log('✅ Done.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
