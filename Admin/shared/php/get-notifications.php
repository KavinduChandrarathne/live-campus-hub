<?php
header('Content-Type: application/json');
$notificationsFile = '../json/notifications.json';
$clubJoinFile = '../json/club-join-requests.json';
$studentId = isset($_GET['studentId']) ? trim($_GET['studentId']) : '';

// Get user's club memberships
$userClubs = [];
if ($studentId) {
    // Load users to get joinedClubs
    $usersFile = '../json/users.json';
    if (file_exists($usersFile)) {
        $usersJson = file_get_contents($usersFile);
        $allUsers = json_decode($usersJson, true);
        if (is_array($allUsers)) {
            foreach ($allUsers as $u) {
                if (isset($u['studentId']) && strtoupper(trim($u['studentId'])) === strtoupper($studentId)) {
                    $userClubs = isset($u['joinedClubs']) && is_array($u['joinedClubs']) ? array_map('strtolower', $u['joinedClubs']) : [];
                    break;
                }
            }
        }
    }
}

if (file_exists($notificationsFile)) {
    $notifications = json_decode(file_get_contents($notificationsFile), true);
    
    // Filter and ensure all notifications have unique IDs
    $updated = false;
    $filtered = [];
    
    if (is_array($notifications)) {
        foreach ($notifications as &$notif) {
            // Assign ID if missing
            if (!isset($notif['id']) || empty($notif['id'])) {
                $notif['id'] = uniqid('notif_');
                $updated = true;
            }
            
            // Filter notifications based on type
            if (isset($notif['type']) && $notif['type'] === 'club') {
                // Only show club notifications if user is a member of that club
                $clubName = isset($notif['clubName']) ? strtolower($notif['clubName']) : '';
                if ($clubName && in_array($clubName, $userClubs)) {
                    $filtered[] = $notif;
                }
            } else {
                // Always show direct and facility notifications
                $filtered[] = $notif;
            }
        }
        unset($notif);
        
        // Save updated notifications if any were missing IDs
        if ($updated) {
            file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));
        }
    }
    
    echo json_encode($filtered);
} else {
    echo json_encode([]);
}
?>
