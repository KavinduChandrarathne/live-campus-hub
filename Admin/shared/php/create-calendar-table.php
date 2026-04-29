<?php
include 'db.php';

global $pdo;

$sql = "CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    category ENUM('personal', 'meeting', 'event', 'other', 'lecture', 'exam', 'workshop', 'notice') NOT NULL,
    icon VARCHAR(100),
    created_by_type ENUM('user', 'admin') NOT NULL,
    created_by_id INT NOT NULL,
    club_id INT NULL,
    reminder_minutes INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    INDEX idx_date (event_date),
    INDEX idx_category (category),
    INDEX idx_created_by (created_by_type, created_by_id),
    INDEX idx_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

$pdo->exec($sql);
echo "Table calendar_events created successfully!\n";