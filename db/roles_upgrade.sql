-- Run once on an existing NepMart database after its users table exists.
USE nepmart;
ALTER TABLE users ADD role ENUM('customer','employee','admin') NOT NULL DEFAULT 'customer' AFTER password_hash;