-- ============================================================
-- University Inventory Management System
-- Sprint 1 – Database Schema
-- ============================================================

-- USER table (must be created first – no FKs)
CREATE TABLE USER (
  user_id      INT PRIMARY KEY AUTO_INCREMENT,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('Admin', 'VO') NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ROOM table
CREATE TABLE ROOM (
  room_id       INT PRIMARY KEY AUTO_INCREMENT,
  room_name     VARCHAR(100) NOT NULL UNIQUE,
  location_type ENUM('Lab','Classroom','Cabin','Office') NOT NULL,
  department    VARCHAR(100),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ITEM table (depends on ROOM)
CREATE TABLE ITEM (
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
CREATE TABLE QR_CODE (
  qr_id        INT PRIMARY KEY AUTO_INCREMENT,
  item_id      VARCHAR(20) NOT NULL UNIQUE,
  qr_data      TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES ITEM(item_id)
);

-- VERIFICATION table (depends on ITEM and USER)
CREATE TABLE VERIFICATION (
  ver_id     INT PRIMARY KEY AUTO_INCREMENT,
  item_id    VARCHAR(20) NOT NULL,
  officer_id INT NOT NULL,
  ver_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status     ENUM('Verified','Pending') DEFAULT 'Pending',
  FOREIGN KEY (item_id)    REFERENCES ITEM(item_id),
  FOREIGN KEY (officer_id) REFERENCES USER(user_id)
);

-- VER_HISTORY table (depends on VERIFICATION, ITEM, USER)
CREATE TABLE VER_HISTORY (
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
  ('officer1', '$2b$10$PLACEHOLDER_VO_HASH',    'VO');
-- Run: node seed.js  to generate real hashes
