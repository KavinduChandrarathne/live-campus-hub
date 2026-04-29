CREATE DATABASE IF NOT EXISTS campus_hub;
USE campus_hub;

-- admin accounts
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    studentId VARCHAR(50) UNIQUE NOT NULL,
    dob DATE,
    picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user accounts
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    studentId VARCHAR(50) UNIQUE NOT NULL,
    faculty VARCHAR(100),
    dob DATE,
    picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_studentId (studentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User rewards: points, badges, tiers
CREATE TABLE user_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    points INT DEFAULT 0 CHECK (points >= 0),
    badges INT DEFAULT 0 CHECK (badges >= 0),
    tier ENUM('BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'PLATINUM') DEFAULT 'BRONZE',
    login_streak INT DEFAULT 0 CHECK (login_streak >= 0),
    last_login_date DATE,
    daily_usage_points INT DEFAULT 0 CHECK (daily_usage_points >= 0),
    daily_usage_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tier (tier),
    INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- campus clubs info
CREATE TABLE clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user-club links
CREATE TABLE club_memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_club (user_id, club_id),
    INDEX idx_user (user_id),
    INDEX idx_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Club join requests 
CREATE TABLE club_join_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_club (club_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Club updates
CREATE TABLE club_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    icon VARCHAR(100),
    message VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club (club_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- shuttle routes
CREATE TABLE transit_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transit memberships
CREATE TABLE transit_route_memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transit_routes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_route (user_id, route_id),
    INDEX idx_user (user_id),
    INDEX idx_route (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transit join requests
CREATE TABLE transit_join_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transit_routes(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_route (route_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transit updates: route announcements
CREATE TABLE transit_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    icon VARCHAR(100),
    message VARCHAR(500),
    description TEXT,
    live_link VARCHAR(255),
    created_by_username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES transit_routes(id) ON DELETE CASCADE,
    INDEX idx_route (route_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Facility updates
CREATE TABLE facility_event_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(100),
    message VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY DEFAULT (CONCAT('notif_', SUBSTR(MD5(CONCAT(UUID(), RAND())), 1, 12))),
    type ENUM('direct', 'club', 'facility') DEFAULT 'direct',
    title VARCHAR(255),
    message TEXT,
    club_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_created (created_at),
    INDEX idx_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User daily activity
CREATE TABLE user_daily_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_date DATE NOT NULL,
    points_earned INT DEFAULT 0,
    activity_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, activity_date),
    INDEX idx_user (user_id),
    INDEX idx_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendar events (user and admin created)
CREATE TABLE calendar_events (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert data
INSERT INTO admins (email, password, firstName, lastName, studentId, dob, picture) VALUES
('admin1@example.com', 'admin123', 'Alice', 'Johnson', 'A1001', '1990-01-01', 'images/admin.png'),
('admin2@example.com', 'admin456', 'Bob', 'Smith', 'A1002', '1991-02-02', 'images/admin.png'),
('admin3@example.com', 'admin789', 'Carol', 'Williams', 'A1003', '1992-03-03', 'images/admin.png');

INSERT INTO users (username, email, password, role, firstName, lastName, studentId, faculty, dob, picture) VALUES
('aliceanderson', 'alice@campushub.com', '.6KwQrPquFx0PiKgUqnt/QIrSVSpsBcS', 'student', 'Alice', 'Anderson', 'S1001', 'Business', '2000-03-15', './images/person1.png'),
('bobbrown', 'bob@campushub.com', '/ez0G0FCN8Psnyx3EW', 'student', 'Bob', 'Brown', 'A1001', 'Business', '1998-10-30', './images/person2.png'),
('charlieClark', 'charlie@campushub.com', '/hWXVveRw3Lcf4taOEAkx8YLA8.kxucF0pJhsK', 'student', 'Charlie', 'Clark', 'S1003', 'Arts', '1999-07-22', './images/person3.png'),
('testuser', 'testuser@campushub.com', '.xiID.ylzi7dN6dv6R/pzqmuy4hiE0IjaT/gK', 'student', 'Test', 'User', 'S1006', 'Business', '2026-03-25', './images/profile_e5cf8952c0d1af43cd0d216b10e39962.png'),
('testuser2', 'user2@campushub.com', '.AXXPzLDnf6nB/cAXapDfoVaBVeJXVji', 'student', 'test', 'User 2', 'S1007', 'Science', '2026-03-02', './images/default.png'),
('testuser3', 'test3@campushub.com', '.xiID.ylzi7dN6dv6R/pzqmuy4hiE0IjaT/gK', 'student', 'Test', 'User 3', 'S1008', 'Arts', '2026-03-05', './images/default.png'),
('testuser4', 'test4@campushub.com', '.xiID.ylzi7dN6dv6R/pzqmuy4hiE0IjaT/gK', 'student', 'test', 'User 3', 'S1009', 'Science', '2026-03-03', './images/default.png');

INSERT INTO user_rewards (user_id, points, badges, tier, login_streak, last_login_date, daily_usage_points, daily_usage_date) VALUES
(1, 45, 0, 'BRONZE', 1, '2026-03-22', 5, '2026-03-22'),
(2, 100, 0, 'SILVER', 0, NULL, 0, NULL),
(3, 20, 0, 'BRONZE', 1, '2026-03-22', 5, '2026-03-22'),
(4, 122, 0, 'SILVER', 0, NULL, 0, NULL),
(5, 0, 0, 'BRONZE', 0, NULL, 0, NULL),
(6, 0, 0, 'BRONZE', 0, NULL, 0, NULL),
(7, 0, 0, 'BRONZE', 0, NULL, 0, NULL);

INSERT INTO clubs (name, icon, description) VALUES
('Coding Club', 'fa-user-group', 'Explore clubs and view the latest updates from each community.'),
('Rotaract Club', 'fa-bus', 'Explore clubs and view the latest updates from each community.'),
('Sports Society', 'fa-basketball', 'Explore clubs and view the latest updates from each community.'),
('Leo Club', 'fa-dragon', 'Explore clubs and view the latest updates from each community.'),
('Media Society', 'fa-music', 'Explore clubs and view the latest updates from each community.'),
('Photography Club', 'fa-camera', 'Explore clubs and view the latest updates from each community.'),
('new test', 'fa-user-group', '');

INSERT INTO club_memberships (user_id, club_id) VALUES
(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 4), (2, 6), (2, 5), (2, 3),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7),
(6, 1);

INSERT INTO transit_routes (name, icon) VALUES
('Gampaha', 'fa-bus'),
('Negombo', 'fa-umbrella-beach'),
('Wattala', 'fa-bus'),
('Moratuwa', 'fa-bus');

INSERT INTO transit_route_memberships (user_id, route_id) VALUES
(1, 1), (1, 3),
(2, 2), (2, 1), (2, 3),
(3, 4), (3, 1), (3, 2), (3, 3),
(4, 1);

INSERT INTO club_updates (club_id, icon, message, description) VALUES
(1, 'fa-users', 'Welcome to the Coding Club!', 'Check out our new repository of beginner projects.'),
(2, 'fa-bus', 'Upcoming Charity Drive', 'Join the Rotaract team this Saturday for a community clean-up.'),
(3, 'fa-basketball', 'Spring Tournament Registration', 'Sign up your team for the intramural basketball tournament.'),
(1, 'fa-users', 'test new 2', ''),
(1, 'fa-users', 'test new', ''),
(1, 'fa-users', 'task 1', 'egfws');

INSERT INTO transit_updates (route_id, icon, message, description, live_link, created_by_username) VALUES
(1, 'fa-bus', 'test user', '', '', 'Alice Anderson'),
(1, 'fa-bus', 'test new', '', 'https:/:', NULL),
(1, 'fa-bus', 'test new', '', 'https?kjnacljk', NULL),
(2, 'fa-umbrella-beach', 'test new', '', '', NULL),
(2, 'fa-umbrella-beach', 'test new', 'egfws', '', NULL),
(1, 'fa-bus', 'test new', 'fth', '', NULL),
(1, 'fa-bus', 'task 2', '2', '', NULL),
(1, 'fa-bus', 'task 1', 'fth', '', NULL),
(1, 'fa-bus', 'test new', 'test', '', NULL);

INSERT INTO facility_event_updates (icon, message, description) VALUES
('fa-envelope', 'test message', 'test message'),
('fa-book', 'The gym will be closed at 10.00 PM', 'Due to the Scheduled maintenance, the campus gym will be close early today'),
('fa-triangle-exclamation', 'testcase', 'test case 1'),
('fa-envelope', 'The gym will be closed at 10.00 PM', 'Due to the Scheduled maintenance, the campus gym will be close early today'),
('fa-dumbbell', 'The gym will be closed at 10.00 PM', 'Due to the Scheduled maintenance, the campus gym will be close early today'),
('fa-envelope', 'The gym will be closed at 10.00 PM', 'Due to the Scheduled maintenance, the campus gym will be close early today'),
('fa-dumbbell', 'The gym will be closed at 10.00 PM', 'Due to the Scheduled maintenance, the campus gym will be close early today');

INSERT INTO club_join_requests (user_id, club_id, status, message) VALUES
(3, 3, 'pending', ''),
(3, 2, 'pending', ''),
(3, 1, 'pending', ''),
(2, 3, 'accepted', ''),
(2, 2, 'rejected', ''),
(2, 1, 'pending', '');

INSERT INTO transit_join_requests (user_id, route_id, status) VALUES
(3, 3, 'accepted'),
(4, 1, 'accepted'),
(2, 3, 'accepted');

INSERT INTO notifications (type, title, message, club_id) VALUES
('direct', 'Reward Earned', 'You earned 5 points for Daily login.', NULL),
('direct', 'Reward Earned', 'You earned 20 points for Joining a club.', NULL),
('direct', 'Tier Upgrade', 'Congratulations! You''ve reached SILVER tier.', NULL),
('direct', 'Reward Earned', 'You earned 15 points for Joining a shuttle route.', NULL),
('facility', 'Gym Closed', 'The gym will be closed early today.', NULL),
('club', 'New Club Update', 'New activity in your club!', 1);
