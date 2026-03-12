<?php
header('Content-Type: application/json');
$notificationsFile = '../json/notifications.json';
$clubJoinFile = '../json/club-join-requests.json';
$studentId = isset($_GET['studentId']) ? trim($_GET['studentId']) : '';

// Get user's club memberships
$userClubs = [];
if ($studentId && file_exists($clubJoinFile)) {
    $clubJoinRequests = json_decode(file_get_contents($clubJoinFile), true);
    if (is_array($clubJoinRequests)) {
        foreach ($clubJoinRequests as $request) {
            // Only include accepted membership requests for this user
            if (isset($request['studentId']) && $request['studentId'] === $studentId && 
                isset($request['status']) && $request['status'] === 'accepted') {
                $userClubs[] = strtolower($request['clubName']);
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
