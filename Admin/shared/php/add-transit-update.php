<?php
// Add a new transit update (regular or live-link) to JSON
date_default_timezone_set('Asia/Colombo');
$updatesFile = '../json/transit-updates.json';
$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-bus';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $liveLink = isset($_POST['liveLink']) ? trim($_POST['liveLink']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';

    if ($route === '' || $message === '') {
        echo json_encode(['success' => false, 'error' => 'Route and message are required']);
        exit;
    }

    $update = [
        'route' => $route,
        'icon' => $icon,
        'message' => $message,
        'description' => $description,
        'liveLink' => $liveLink,
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
            'type' => 'transit',
            'title' => 'Transit Update - ' . $route,
            'message' => $message,
            'description' => $description,
            'route' => $route,
            'datetime' => date('Y-m-d H:i:s')
        ];

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

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
