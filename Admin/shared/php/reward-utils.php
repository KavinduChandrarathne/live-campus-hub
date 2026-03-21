<?php
// reward-utils.php
// Shared utility for reward point and tier management.

date_default_timezone_set('Asia/Colombo');
$usersFile = __DIR__ . '/../json/users.json';
$notificationsFile = __DIR__ . '/../json/notifications.json';

function loadUsers() {
    global $usersFile;
    if (!file_exists($usersFile)) {
        return [];
    }
    $json = file_get_contents($usersFile);
    $users = json_decode($json, true);
    return is_array($users) ? $users : [];
}

function saveUsers($users) {
    global $usersFile;
    return file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
}

function ensureRewardsStruct(&$user) {
    if (!isset($user['rewards']) || !is_array($user['rewards'])) {
        $user['rewards'] = [];
    }
    $defaults = [
        'points' => 0,
        'badges' => 0,
        'tier' => 'BRONZE',
        'pointsToNext' => 100,
        'nextTier' => 'SILVER',
        'loginStreak' => 0,
        'lastLoginDate' => '',
        'dailyUsagePoints' => 0,
        'dailyUsageDate' => ''
    ];
    foreach ($defaults as $k => $v) {
        if (!isset($user['rewards'][$k])) {
            $user['rewards'][$k] = $v;
        }
    }

    // ensure only the current tier is preserved and no historical tier keys persist
    if (isset($user['rewards']['previousTier'])) {
        unset($user['rewards']['previousTier']);
    }

    $tierInfo = getTierInfo($user['rewards']['points']);
    $user['rewards']['tier'] = $tierInfo['tier'];
    $user['rewards']['pointsToNext'] = $tierInfo['pointsToNext'];
    $user['rewards']['nextTier'] = $tierInfo['nextTier'];
    return $user['rewards'];
}

function getTierInfo($points) {
    $points = max(0, intval($points));
    if ($points >= 1000) {
        return ['tier' => 'PLATINUM', 'nextTier' => '', 'pointsToNext' => 0, 'nextThreshold' => 1000];
    }
    if ($points >= 500) {
        return ['tier' => 'DIAMOND', 'nextTier' => 'PLATINUM', 'pointsToNext' => 1000 - $points, 'nextThreshold' => 1000];
    }
    if ($points >= 250) {
        return ['tier' => 'GOLD', 'nextTier' => 'DIAMOND', 'pointsToNext' => 500 - $points, 'nextThreshold' => 500];
    }
    if ($points >= 100) {
        return ['tier' => 'SILVER', 'nextTier' => 'GOLD', 'pointsToNext' => 250 - $points, 'nextThreshold' => 250];
    }
    return ['tier' => 'BRONZE', 'nextTier' => 'SILVER', 'pointsToNext' => 100 - $points, 'nextThreshold' => 100];
}

function addNotification($title, $message, $type = 'direct', $extra = []) {
    global $notificationsFile;
    $notification = array_merge([
        'id' => uniqid('notif_'),
        'type' => $type,
        'title' => $title,
        'message' => $message,
        'datetime' => date('Y-m-d H:i:s')
    ], $extra);

    $notifications = [];
    if (file_exists($notificationsFile)) {
        $json = file_get_contents($notificationsFile);
        $notifications = json_decode($json, true);
        if (!is_array($notifications)) {
            $notifications = [];
        }
    }
    array_unshift($notifications, $notification);
    file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));
}

function awardUserPoints(&$user, $points = 0, $badges = 0, $isUsagePoint = false, $reason = '') {
    ensureRewardsStruct($user);
    $awarded = 0;
    if ($points !== 0) {
        if ($isUsagePoint) {
            $today = date('Y-m-d');
            if ($user['rewards']['dailyUsageDate'] !== $today) {
                $user['rewards']['dailyUsageDate'] = $today;
                $user['rewards']['dailyUsagePoints'] = 0;
            }
            $daily = max(0, intval($user['rewards']['dailyUsagePoints']));
            $available = max(0, 50 - $daily);
            $awarded = min($points, $available);
            $user['rewards']['dailyUsagePoints'] = $daily + $awarded;
        } else {
            $awarded = $points;
        }
        $user['rewards']['points'] += $awarded;
    }

    if ($badges !== 0) {
        $user['rewards']['badges'] += $badges;
    }

    $previousTier = $user['rewards']['tier'];
    $tierInfo = getTierInfo($user['rewards']['points']);
    $user['rewards']['tier'] = $tierInfo['tier'];
    $user['rewards']['pointsToNext'] = $tierInfo['pointsToNext'];
    $user['rewards']['nextTier'] = $tierInfo['nextTier'];

    $levelUp = false;
    if ($previousTier !== $user['rewards']['tier']) {
        $levelUp = true;
        addNotification('Tier Upgrade', "Congratulations! You've reached {$user['rewards']['tier']} tier.", 'direct');
    }

    if ($awarded > 0) {
        $msg = "You earned {$awarded} points" . ($reason ? " for {$reason}" : '') . '.';
        addNotification('Reward Earned', $msg, 'direct');
    }

    return ['awarded' => $awarded, 'tierUp' => $levelUp, 'newTier' => $user['rewards']['tier']];
}

function saveAndReturnUser($users, $user) {
    saveUsers($users);
    return $user;
}

function findUser(&$users, $emailOrUsernameOrStudentId) {
    $needle = trim(strtolower($emailOrUsernameOrStudentId));
    foreach ($users as &$user) {
        if (isset($user['email']) && strtolower($user['email']) === $needle) return $user;
        if (isset($user['username']) && strtolower($user['username']) === $needle) return $user;
        if (isset($user['studentId']) && strtolower($user['studentId']) === $needle) return $user;
    }
    return null;
}

function findUserIndex($users, $emailOrUsernameOrStudentId) {
    $needle = trim(strtolower($emailOrUsernameOrStudentId));
    foreach ($users as $idx => $user) {
        if (isset($user['email']) && strtolower($user['email']) === $needle) return $idx;
        if (isset($user['username']) && strtolower($user['username']) === $needle) return $idx;
        if (isset($user['studentId']) && strtolower($user['studentId']) === $needle) return $idx;
    }
    return null;
}
