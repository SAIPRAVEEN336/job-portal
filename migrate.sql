CREATE DATABASE IF NOT EXISTS jobconnect_db;
USE jobconnect_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  resume TEXT NOT NULL,
  coverLetter TEXT,
  company VARCHAR(255),
  role VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, fullname, email, password, created_at) VALUES
(1, 'Test User', 'test@example.com', '$2b$10$NxhhsK5zbrKH2wmx/NWRxOiIhSYHeKXbTsU2BwNLeZkEEoAIlktsK', '2025-09-23 06:27:27'),
(2, 'qwertyuio', 'scc667785@gmail.com', '$2b$10$7lhHHrSadwYqIr2EsNJmxOKfi1JKxcJvCdq5kG/9pTAdXn.Qe2J2K', '2025-09-23 06:34:45');

INSERT INTO login_logs (id, user_id, email, login_time) VALUES
(1, 1, 'test@example.com', '2025-09-23 06:27:36'),
(2, 2, 'scc667785@gmail.com', '2025-09-23 06:34:55');