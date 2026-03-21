<?php
header('Content-Type: application/json');
require_once 'reward-utils.php';

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

$users = loadUsers();
$needle = $email !== '' ? $email : $userId;
$index = findUserIndex($users, $needle);
if ($index === null) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

$user = &$users[$index];
ensureRewardsStruct($user);
$responseMessage = '';

switch ($action) {
    case 'dailyLogin':
        $today = date('Y-m-d');
        $lastLogin = $user['rewards']['lastLoginDate'] ?? '';
        if ($lastLogin === $today) {
            $responseMessage = 'Daily login already counted for today';
            break;
        }

        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $streak = intval($user['rewards']['loginStreak'] ?? 0);
        $streak = ($lastLogin === $yesterday) ? $streak + 1 : 1;
        $user['rewards']['loginStreak'] = $streak;
        $user['rewards']['lastLoginDate'] = $today;

        $result = awardUserPoints($user, 5, 0, true, 'Daily login');
        $responseMessage = 'Daily login points added.';

        if ($streak === 7) {
            awardUserPoints($user, 10, 0, true, '7-day streak');
            $responseMessage = '7-day streak bonus earned!';
        } elseif ($streak === 30) {
            awardUserPoints($user, 50, 0, true, '30-day streak');
            $responseMessage = '30-day streak bonus earned!';
        }
        break;

    case 'usage':
        if ($points <= 0) {
            echo json_encode(['success' => false, 'error' => 'Points must be > 0']);
            exit;
        }
        $result = awardUserPoints($user, $points, 0, true, 'Engagement usage');
        if ($result['awarded'] === 0) {
            $responseMessage = 'Daily usage limit reached';
        } else {
            $responseMessage = "Awarded {$result['awarded']} points for activity";
        }
        break;

    case 'clubJoin':
        $base = 20;
        $firstClubBonus = 0;
        $joinedClubs = isset($user['joinedClubs']) && is_array($user['joinedClubs']) ? $user['joinedClubs'] : [];
        if (count($joinedClubs) === 0) {
            $firstClubBonus = 10;
        }
        $result = awardUserPoints($user, $base, 0, false, 'Club joined');
        if ($firstClubBonus > 0) {
            awardUserPoints($user, $firstClubBonus, 0, false, 'First club joined');
        }
        $responseMessage = 'Club join points applied';
        break;

    case 'routeJoin':
        $base = 15;
        $firstRouteBonus = 0;
        $joinedRoutes = isset($user['joinedRoutes']) && is_array($user['joinedRoutes']) ? $user['joinedRoutes'] : [];
        if (count($joinedRoutes) === 0) {
            $firstRouteBonus = 10;
        }
        $result = awardUserPoints($user, $base, 0, false, 'Shuttle route joined');
        if ($firstRouteBonus > 0) {
            awardUserPoints($user, $firstRouteBonus, 0, false, 'First shuttle joined');
        }
        $responseMessage = 'Route join points applied';
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid reward action']);
        exit;
}

saveUsers($users);

echo json_encode(['success' => true, 'message' => $responseMessage, 'user' => $user]);
exit;
