<?php
header('Content-Type: application/json');
date_default_timezone_set('Asia/Colombo');

$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $notifId = isset($_POST['id']) ? trim($_POST['id']) : '';

    if ($notifId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid notification ID']);
        exit;
    }

    // Read existing notifications
    $notifications = [];
    if (file_exists($notificationsFile)) {
        $json = file_get_contents($notificationsFile);
        $notifications = json_decode($json, true);
        if (!is_array($notifications)) {
            $notifications = [];
        }
    }

    // Find and remove notification by ID
    $found = false;
    foreach ($notifications as $index => $notif) {
        if (isset($notif['id']) && $notif['id'] === $notifId) {
            array_splice($notifications, $index, 1);
            $found = true;
            break;
        }
    }

    if (!$found) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Notification not found']);
        exit;
    }

    // Save back to JSON file
    file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true]);
    exit;
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
?>
