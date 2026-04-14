-- ============================================================
-- University Inventory Management System
-- Sprint 2 – Database Schema (includes Sprint 1 + seed data)
-- ============================================================

-- USER table (must be created first – no FKs)
CREATE TABLE IF NOT EXISTS USER (
  user_id      INT PRIMARY KEY AUTO_INCREMENT,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('Admin', 'VO') NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ROOM table
CREATE TABLE IF NOT EXISTS ROOM (
  room_id       INT PRIMARY KEY AUTO_INCREMENT,
  room_name     VARCHAR(100) NOT NULL UNIQUE,
  location_type ENUM('Lab','Classroom','Cabin','Office') NOT NULL,
  department    VARCHAR(100),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ITEM table (depends on ROOM)
CREATE TABLE IF NOT EXISTS ITEM (
  item_id       VARCHAR(20) PRIMARY KEY,
  room_id       INT NOT NULL,
  item_name     VARCHAR(100) NOT NULL,
  item_type     VARCHAR(50)  NOT NULL,
  purchase_date DATE,
  status        ENUM('Active','Decommissioned') DEFAULT 'Active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES ROOM(room_id)
);

-- QR_CODE table (depends on ITEM)
CREATE TABLE IF NOT EXISTS QR_CODE (
  qr_id        INT PRIMARY KEY AUTO_INCREMENT,
  item_id      VARCHAR(20) NOT NULL UNIQUE,
  qr_data      TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES ITEM(item_id)
);

-- VERIFICATION table (depends on ITEM and USER)
CREATE TABLE IF NOT EXISTS VERIFICATION (
  ver_id     INT PRIMARY KEY AUTO_INCREMENT,
  item_id    VARCHAR(20) NOT NULL,
  officer_id INT NOT NULL,
  ver_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status     ENUM('Verified','Pending') DEFAULT 'Pending',
  FOREIGN KEY (item_id)    REFERENCES ITEM(item_id),
  FOREIGN KEY (officer_id) REFERENCES USER(user_id)
);

-- VER_HISTORY table (depends on VERIFICATION, ITEM, USER)
CREATE TABLE IF NOT EXISTS VER_HISTORY (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  ver_id     INT NOT NULL,
  item_id    VARCHAR(20) NOT NULL,
  officer_id INT NOT NULL,
  ver_date   DATETIME,
  notes      TEXT,
  FOREIGN KEY (ver_id)     REFERENCES VERIFICATION(ver_id),
  FOREIGN KEY (item_id)    REFERENCES ITEM(item_id),
  FOREIGN KEY (officer_id) REFERENCES USER(user_id)
);

-- ============================================================
-- Seed: test users (passwords are bcrypt hashes of 'password123')
-- ============================================================
INSERT INTO USER (username, password_hash, role) VALUES
  ('admin',    '$2b$10$PLACEHOLDER_ADMIN_HASH', 'Admin'),
  ('officer1', '$2b$10$PLACEHOLDER_VO_HASH',    'VO')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- ============================================================
-- Sprint 2 Seed: sample rooms & items
-- ============================================================
INSERT INTO ROOM (room_name, location_type, department) VALUES
  ('Lab 101',        'Lab',       'Computer Science'),
  ('Lab 102',        'Lab',       'Computer Science'),
  ('Classroom 201',  'Classroom', 'Computer Science'),
  ('Prof. Rao Cabin','Cabin',     'Computer Science'),
  ('Admin Office',   'Office',    'Administration')
ON DUPLICATE KEY UPDATE room_name = VALUES(room_name);

INSERT INTO ITEM (item_id, room_id, item_name, item_type, purchase_date) VALUES
  ('ITEM-001', 1, 'Dell Desktop PC',   'Desktop',  '2024-06-15'),
  ('ITEM-002', 1, 'HP Monitor 24"',    'Monitor',  '2024-06-15'),
  ('ITEM-003', 1, 'Logitech Keyboard', 'Keyboard', '2024-07-01'),
  ('ITEM-004', 2, 'Lenovo Desktop PC', 'Desktop',  '2024-08-20'),
  ('ITEM-005', 3, 'Epson Projector',   'Projector','2024-09-10'),
  ('ITEM-006', 4, 'Office Chair',      'Chair',    '2023-03-01'),
  ('ITEM-007', 5, 'Canon Printer',     'Printer',  '2024-01-12')
ON DUPLICATE KEY UPDATE item_id = VALUES(item_id);
