CREATE DATABASE IF NOT EXISTS nepmart CHARACTER SET utf8mb4;
USE nepmart;
CREATE TABLE products(id INT PRIMARY KEY, name VARCHAR(120) NOT NULL, category VARCHAR(60), price DECIMAL(10,2) NOT NULL, old_price DECIMAL(10,2), stock INT DEFAULT 0, rating DECIMAL(2,1) DEFAULT 0, description TEXT);
CREATE TABLE coupons(code VARCHAR(30) PRIMARY KEY, type ENUM('pct','flat') NOT NULL, value INT NOT NULL, active TINYINT DEFAULT 1);
CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(120) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role ENUM('customer','employee','admin') NOT NULL DEFAULT 'customer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE orders(id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, order_no VARCHAR(20) UNIQUE NOT NULL, customer_name VARCHAR(100), email VARCHAR(120), phone VARCHAR(15),
 address VARCHAR(255), city VARCHAR(80), province VARCHAR(40), postal VARCHAR(12), notes TEXT, shipping ENUM('std','exp') DEFAULT 'std',
 subtotal DECIMAL(10,2), discount DECIMAL(10,2), shipping_fee DECIMAL(10,2), total DECIMAL(10,2),
 status ENUM('placed','processing','shipped','out_for_delivery','delivered','cancelled') DEFAULT 'placed', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE order_items(id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_id INT NOT NULL, qty INT NOT NULL, unit_price DECIMAL(10,2) NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id));
CREATE TABLE payments(id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, method ENUM('esewa','khalti','cod') NOT NULL,
 status ENUM('pending','paid','failed','cancelled','refunded') DEFAULT 'pending', amount DECIMAL(10,2), provider_ref VARCHAR(100), gateway_id VARCHAR(100),
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY(order_id) REFERENCES orders(id));
INSERT INTO coupons VALUES('WELCOME10','pct',10,1),('SAVE200','flat',200,1);
INSERT INTO products VALUES
(1,'Dhaka Topi (Premium)','Fashion',1800,2200,25,4.7,'Hand-woven Dhaka fabric cap'),(2,'Pashmina Shawl','Fashion',6500,8000,8,4.8,'Himalayan pashmina blend'),
(3,'Tibetan Singing Bowl','Home & Craft',3200,3200,14,4.6,'Hand-hammered bowl'),(4,'Thanka Wall Art','Home & Craft',4200,5000,3,4.5,'Hand-painted thanka'),
(5,'Ilam Orthodox Tea (250g)','Food & Tea',850,1000,60,4.9,'Whole-leaf Ilam tea'),(6,'Himalayan Honey (500g)','Food & Tea',720,720,0,4.4,'Wild honey'),
(7,'Wireless Earbuds','Electronics',2400,3200,40,4.2,'Bluetooth 5.3'),(8,'Power Bank 20,000mAh','Electronics',2900,3400,5,4.3,'Fast charging'),
(9,'Lokta Paper Journal','Home & Craft',550,700,32,4.6,'Handmade Lokta paper'),(10,'Yak Wool Socks','Fashion',650,800,44,4.5,'Trekking socks'),
(11,'Timur Pepper (100g)','Food & Tea',380,450,70,4.7,'Hill pepper'),(12,'Smart Watch','Electronics',4800,6000,12,4.1,'7-day battery');
