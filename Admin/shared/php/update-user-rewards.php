<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$email = trim($_POST['email'] ?? '');
$action = trim($_POST['action'] ?? '');
$points = isset($_POST['points']) ? intval($_POST['points']) : 0;
$userId = trim($_POST['userId'] ?? '');

if ($email === '' && $userId === '') {
    echo json_encode(['success' => false, 'error' => 'User identification required']);
    exit;
}

try {
    // Get user
    $user = null;
    $userIdToUse = $userId;
    
    if ($email !== '') {
        $user = getUserByEmailOrUsername($pdo, $email);
        if ($user) {
            $userIdToUse = $user['id'];
        }
    } else if ($userId !== '') {
        $user = getUserWithMemberships($pdo, $userId);
        $userIdToUse = $userId;
    }

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    $user = getUserWithMemberships($pdo, $userIdToUse);
    $responseMessage = '';

    switch ($action) {
        case 'dailyLogin':
            $today = date('Y-m-d');
            $lastLogin = $user['last_login_date'] ?? '';
            if ($lastLogin === $today) {
                $responseMessage = 'Daily login already counted for today';
                break;
            }

            // Get current streak
            $yesterday = date('Y-m-d', strtotime('-1 day'));
            $streak = intval($user['login_streak'] ?? 0);
            $streak = ($lastLogin === $yesterday) ? $streak + 1 : 1;

            // Update login streak and date
            $stmt = $pdo->prepare('
                UPDATE user_rewards
                SET login_streak = :streak, last_login_date = :today
                WHERE user_id = :userId
            ');
            $stmt->execute([
                ':streak' => $streak,
                ':today' => $today,
                ':userId' => $userIdToUse
            ]);

            // Award base login points
            awardUserPoints($pdo, $userIdToUse, 5, 0, true, 'Daily login');
            $responseMessage = 'Daily login points added.';

            // Check for streak bonuses
            if ($streak === 7) {
                awardUserPoints($pdo, $userIdToUse, 10, 0, true, '7-day streak');
                $responseMessage = '7-day streak bonus earned!';
            } elseif ($streak === 30) {
                awardUserPoints($pdo, $userIdToUse, 50, 0, true, '30-day streak');
                $responseMessage = '30-day streak bonus earned!';
            }
            break;

        case 'usage':
            if ($points <= 0) {
                echo json_encode(['success' => false, 'error' => 'Points must be > 0']);
                exit;
            }
            $result = awardUserPoints($pdo, $userIdToUse, $points, 0, true, 'Engagement usage');
            if ($result['awarded'] === 0) {
                $responseMessage = 'Daily usage limit reached';
            } else {
                $responseMessage = "Awarded {$result['awarded']} points for activity";
            }
            break;

        case 'clubJoin':
            $base = 20;
            $firstClubBonus = 0;
            
            // Check if user has any club memberships
            $stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM club_memberships WHERE user_id = :userId');
            $stmt->execute([':userId' => $userIdToUse]);
            $countResult = $stmt->fetch();
            if ($countResult['cnt'] === 0) {
                $firstClubBonus = 10;
            }
            
            awardUserPoints($pdo, $userIdToUse, $base, 0, false, 'Club joined');
            if ($firstClubBonus > 0) {
                awardUserPoints($pdo, $userIdToUse, $firstClubBonus, 0, false, 'First club joined');
            }
            $responseMessage = 'Club join points applied';
            break;

        case 'routeJoin':
            $base = 15;
            $firstRouteBonus = 0;
            
            // Check if user has any route memberships
            $stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM transit_route_memberships WHERE user_id = :userId');
            $stmt->execute([':userId' => $userIdToUse]);
            $countResult = $stmt->fetch();
            if ($countResult['cnt'] === 0) {
                $firstRouteBonus = 10;
            }
            
            awardUserPoints($pdo, $userIdToUse, $base, 0, false, 'Shuttle route joined');
            if ($firstRouteBonus > 0) {
                awardUserPoints($pdo, $userIdToUse, $firstRouteBonus, 0, false, 'First shuttle joined');
            }
            $responseMessage = 'Route join points applied';
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Invalid reward action']);
            exit;
    }

    // Get updated user data
    $user = getUserWithMemberships($pdo, $userIdToUse);

    echo json_encode(['success' => true, 'message' => $responseMessage, 'user' => $user]);
    exit;
} catch (PDOException $e) {
    error_log('Reward update error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to update rewards']);
    exit;
}
