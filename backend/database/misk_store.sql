CREATE DATABASE IF NOT EXISTS misk_perfumes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE misk_perfumes;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  admin_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category VARCHAR(60) NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  description TEXT NOT NULL,
  details TEXT DEFAULT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'متوفر',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category),
  KEY idx_products_featured (is_featured),
  KEY idx_products_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admins (username, admin_password)
VALUES ('admin', '$2b$12$oCQVabscXUDFv.1zlNsn5u6Jd49VFMKfPIZ/NtOOVLfXLv27.Y4Km')
ON DUPLICATE KEY UPDATE username = VALUES(username);
