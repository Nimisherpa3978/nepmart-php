-- Run ONLY if you already imported the first schema.sql
USE nepmart;
CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(120) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE orders ADD user_id INT NULL AFTER id;
