<?php
/**
 * db.php - Shared PDO Database Connection
 * Provides connection to campus_hub MySQL database
 * Used by all API endpoints for database operations
 */

date_default_timezone_set('Asia/Colombo');

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'campus_hub');

// Create PDO connection
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    error_log('Database Error: ' . $e->getMessage());
    exit;
}

/**
 * Reward Tier Calculation
 * Returns tier info based on points
 */
function getTierInfo($points) {
    $points = max(0, intval($points));
    if ($points >= 1000) {
        return [
            'tier' => 'PLATINUM',
            'nextTier' => '',
            'pointsToNext' => 0,
            'nextThreshold' => 1000
        ];
    }
    if ($points >= 500) {
        return [
            'tier' => 'DIAMOND',
            'nextTier' => 'PLATINUM',
            'pointsToNext' => 1000 - $points,
            'nextThreshold' => 1000
        ];
    }
    if ($points >= 250) {
        return [
            'tier' => 'GOLD',
            'nextTier' => 'DIAMOND',
            'pointsToNext' => 500 - $points,
            'nextThreshold' => 500
        ];
    }
    if ($points >= 100) {
        return [
            'tier' => 'SILVER',
            'nextTier' => 'GOLD',
            'pointsToNext' => 250 - $points,
            'nextThreshold' => 250
        ];
    }
    return [
        'tier' => 'BRONZE',
        'nextTier' => 'SILVER',
        'pointsToNext' => 100 - $points,
        'nextThreshold' => 100
    ];
}

/**
 * Add Notification
 * Creates a notification in the database
 */
function addNotification($pdo, $title, $message, $type = 'direct', $clubId = null) {
    try {
        $stmt = $pdo->prepare('
            INSERT INTO notifications (type, title, message, club_id, created_at)
            VALUES (:type, :title, :message, :clubId, NOW())
        ');
        $stmt->execute([
            ':type' => $type,
            ':title' => $title,
            ':message' => $message,
            ':clubId' => $clubId
        ]);
        return true;
    } catch (PDOException $e) {
        error_log('Notification Insert Error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Get User by Email or Username
 */
function getUserByEmailOrUsername($pdo, $identifier) {
    try {
        $stmt = $pdo->prepare('
            SELECT u.id, u.username, u.email, u.password, u.role, u.firstName, u.lastName, u.studentId, u.faculty, u.dob, u.picture,
                   r.points, r.badges, r.tier, r.login_streak, r.last_login_date,
                   r.daily_usage_points, r.daily_usage_date
            FROM users u
            LEFT JOIN user_rewards r ON u.id = r.user_id
            WHERE LOWER(u.email) = LOWER(:identifier) OR LOWER(u.username) = LOWER(:identifier)
            LIMIT 1
        ');
        $stmt->execute([':identifier' => $identifier]);
        $user = $stmt->fetch();
        return $user;
    } catch (PDOException $e) {
        error_log('User Fetch Error: ' . $e->getMessage());
        return null;
    }
}

/**
 * Get User by Student ID
 */
function getUserByStudentId($pdo, $studentId) {
    try {
        $stmt = $pdo->prepare('
            SELECT u.id, u.username, u.email, u.password, u.role, u.firstName, u.lastName, u.studentId, u.faculty, u.dob, u.picture,
                   r.points, r.badges, r.tier, r.login_streak, r.last_login_date,
                   r.daily_usage_points, r.daily_usage_date
            FROM users u
            LEFT JOIN user_rewards r ON u.id = r.user_id
            WHERE LOWER(u.studentId) = LOWER(:studentId)
            LIMIT 1
        ');
        $stmt->execute([':studentId' => $studentId]);
        $user = $stmt->fetch();
        return $user;
    } catch (PDOException $e) {
        error_log('User Fetch Error: ' . $e->getMessage());
        return null;
    }
}

/**
 * Get User with Joined Clubs and Routes
 * Returns user array with joinedClubs and joinedRoutes arrays
 */
function getUserWithMemberships($pdo, $userId) {
    try {
        // Get base user with rewards
        $stmt = $pdo->prepare('
            SELECT u.id, u.username, u.email, u.password, u.role, u.firstName, u.lastName, u.studentId, u.faculty, u.dob, u.picture,
            r.points, r.badges, r.tier, r.login_streak, r.last_login_date,
                   r.daily_usage_points, r.daily_usage_date
            FROM users u
            LEFT JOIN user_rewards r ON u.id = r.user_id
            WHERE u.id = :userId
            LIMIT 1
        ');
        $stmt->execute([':userId' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return null;
        }

        // Get joined clubs
        $stmt = $pdo->prepare('
            SELECT c.name
            FROM club_memberships cm
            JOIN clubs c ON cm.club_id = c.id
            WHERE cm.user_id = :userId
            ORDER BY cm.joined_at DESC
        ');
        $stmt->execute([':userId' => $userId]);
        $clubs = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        $user['joinedClubs'] = $clubs ?: [];

        // Get joined routes
        $stmt = $pdo->prepare('
            SELECT r.name
            FROM transit_route_memberships trm
            JOIN transit_routes r ON trm.route_id = r.id
            WHERE trm.user_id = :userId
            ORDER BY trm.joined_at DESC
        ');
        $stmt->execute([':userId' => $userId]);
        $routes = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        $user['joinedRoutes'] = $routes ?: [];

        // Build rewards structure for frontend compatibility
        $user['rewards'] = [
            'points' => $user['points'] ?? 0,
            'badges' => $user['badges'] ?? 0,
            'tier' => $user['tier'] ?? 'BRONZE',
            'pointsToNext' => getTierInfo($user['points'] ?? 0)['pointsToNext'],
            'nextTier' => getTierInfo($user['points'] ?? 0)['nextTier'],
            'loginStreak' => $user['login_streak'] ?? 0,
            'lastLoginDate' => $user['last_login_date'] ?? '',
            'dailyUsagePoints' => $user['daily_usage_points'] ?? 0,
            'dailyUsageDate' => $user['daily_usage_date'] ?? ''
        ];

        return $user;
    } catch (PDOException $e) {
        error_log('User Fetch Error: ' . $e->getMessage());
        return null;
    }
}

/**
 * Award User Points
 * Handles points, badges, and tier progression
 */
function awardUserPoints($pdo, $userId, $points = 0, $badges = 0, $isUsagePoint = false, $reason = '') {
    try {
        // Get current user rewards
        $stmt = $pdo->prepare('
            SELECT * FROM user_rewards WHERE user_id = :userId
        ');
        $stmt->execute([':userId' => $userId]);
        $rewards = $stmt->fetch();

        if (!$rewards) {
            // Create rewards record if not exists
            $stmt = $pdo->prepare('
                INSERT INTO user_rewards (user_id, points, badges, tier)
                VALUES (:userId, 0, 0, "BRONZE")
            ');
            $stmt->execute([':userId' => $userId]);
            $rewards = ['points' => 0, 'badges' => 0, 'tier' => 'BRONZE', 'daily_usage_points' => 0, 'daily_usage_date' => null];
        }

        $awarded = 0;
        $newPoints = $rewards['points'];

        if ($points !== 0) {
            if ($isUsagePoint) {
                $today = date('Y-m-d');
                $daily = max(0, intval($rewards['daily_usage_points'] ?? 0));
                $available = max(0, 50 - $daily);
                $awarded = min($points, $available);
                $newPoints += $awarded;

                $stmt = $pdo->prepare('
                    UPDATE user_rewards
                    SET daily_usage_points = :daily,
                        daily_usage_date = :date,
                        points = :points
                    WHERE user_id = :userId
                ');
                $stmt->execute([
                    ':daily' => $daily + $awarded,
                    ':date' => $today,
                    ':points' => $newPoints,
                    ':userId' => $userId
                ]);
            } else {
                $awarded = $points;
                $newPoints += $awarded;

                $stmt = $pdo->prepare('
                    UPDATE user_rewards
                    SET points = :points
                    WHERE user_id = :userId
                ');
                $stmt->execute([
                    ':points' => $newPoints,
                    ':userId' => $userId
                ]);
            }
        }

        if ($badges !== 0) {
            $stmt = $pdo->prepare('
                UPDATE user_rewards
                SET badges = badges + :badges
                WHERE user_id = :userId
            ');
            $stmt->execute([
                ':badges' => $badges,
                ':userId' => $userId
            ]);
        }

        // Check for tier change
        $previousTier = $rewards['tier'];
        $tierInfo = getTierInfo($newPoints);
        $newTier = $tierInfo['tier'];
        $levelUp = ($previousTier !== $newTier);

        if ($levelUp) {
            $stmt = $pdo->prepare('
                UPDATE user_rewards
                SET tier = :tier
                WHERE user_id = :userId
            ');
            $stmt->execute([
                ':tier' => $newTier,
                ':userId' => $userId
            ]);
            addNotification($pdo, 'Tier Upgrade', "Congratulations! You've reached {$newTier} tier.", 'direct');
        }

        if ($awarded > 0) {
            $msg = "You earned {$awarded} points" . ($reason ? " for {$reason}" : '') . '.';
            addNotification($pdo, 'Reward Earned', $msg, 'direct');
        }

        return [
            'awarded' => $awarded,
            'tierUp' => $levelUp,
            'newTier' => $newTier
        ];
    } catch (PDOException $e) {
        error_log('Award Points Error: ' . $e->getMessage());
        return ['awarded' => 0, 'tierUp' => false, 'newTier' => $rewards['tier'] ?? 'BRONZE'];
    }
}
?>
