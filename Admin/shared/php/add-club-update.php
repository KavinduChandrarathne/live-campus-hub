<?php
// Add a new club-specific update to JSON
date_default_timezone_set('Asia/Colombo');
$updatesFile = '../json/club-updates.json';
$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $club = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-users';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';

    if ($club === '' || $message === '') {
        echo json_encode(['success' => false, 'error' => 'Club and message are required']);
        exit;
    }

    $update = [
        'clubName' => $club,
        'icon' => $icon,
        'message' => $message,
        'description' => $description,
        'datetime' => date('Y-m-d H:i:s')
    ];

    $updates = [];
    if (file_exists($updatesFile)) {
        $json = file_get_contents($updatesFile);
        $updates = json_decode($json, true);
        if (!is_array($updates)) {
            $updates = [];
        }
    }

    array_unshift($updates, $update);
    file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));

    // If send as notification is checked, create a notification
    if ($sendNotification) {
        $notification = [
            'id' => uniqid('notif_'),
            'type' => 'club',
            'title' => 'Club Update - ' . $club,
            'message' => $message,
            'description' => $description,
            'clubName' => $club,
            'datetime' => date('Y-m-d H:i:s')
        ];

        // Read existing notifications
        $notifications = [];
        if (file_exists($notificationsFile)) {
            $json = file_get_contents($notificationsFile);
            $notifications = json_decode($json, true);
            if (!is_array($notifications)) {
                $notifications = [];
            }
        }

        // Add new notification to the beginning
        array_unshift($notifications, $notification);

        // Save back to JSON file
        file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
