<?php
// Delete a facility/event update by index
$updatesFile = '../json/facility-event-updates.json';
$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    if ($index < 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid index']);
        exit;
    }
    $updates = [];
    if (file_exists($updatesFile)) {
        $json = file_get_contents($updatesFile);
        $updates = json_decode($json, true);
        if (!is_array($updates)) $updates = [];
    }
    if ($index >= 0 && $index < count($updates)) {
        $deletedUpdate = $updates[$index];
        array_splice($updates, $index, 1);
        file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));
        
        // Delete corresponding notification if it exists
        if (isset($deletedUpdate['message']) && isset($deletedUpdate['datetime'])) {
            $notifications = [];
            if (file_exists($notificationsFile)) {
                $json = file_get_contents($notificationsFile);
                $notifications = json_decode($json, true);
                if (!is_array($notifications)) $notifications = [];
            }
            
            // Find and remove notification that matches this update
            foreach ($notifications as $notifIdx => $notif) {
                if (isset($notif['type']) && $notif['type'] === 'facility' && 
                    isset($notif['message']) && $notif['message'] === $deletedUpdate['message'] &&
                    isset($notif['datetime']) && $notif['datetime'] === $deletedUpdate['datetime']) {
                    array_splice($notifications, $notifIdx, 1);
                    break;
                }
            }
            
            file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));
        }
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Index out of range']);
    }
    exit;
}
// Invalid request
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
