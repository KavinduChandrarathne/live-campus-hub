<?php
header('Content-Type: application/json');
date_default_timezone_set('Asia/Colombo'); // Set Sri Lanka timezone
// Path to the shared facility-event-updates.json file
$updatesFile = '../json/facility-event-updates.json';
$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-envelope';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';

    // Validate
    if ($message === '') {
        echo json_encode(['success' => false, 'error' => 'Message is required.']);
        exit;
    }

    // Create update array
    $update = [
        'icon' => $icon,
        'message' => $message,
        'description' => $description,
        'datetime' => date('Y-m-d H:i:s'),
        'title' => $message
    ];

    // Read existing updates
    $updates = [];
    if (file_exists($updatesFile)) {
        $json = file_get_contents($updatesFile);
        $updates = json_decode($json, true);
        if (!is_array($updates)) {
            $updates = [];
        }
    }

    // Add new update to the beginning
    array_unshift($updates, $update);

    // Save back to JSON file
    file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));

    // If send as notification is checked, create a notification
    if ($sendNotification) {
        $notification = [
            'id' => uniqid('notif_'),
            'type' => 'facility',
            'title' => 'Facility & Event Update',
            'message' => $message,
            'description' => $description,
            'facility' => $message,
            'datetime' => date('Y-m-d H:i:s'),
            'icon' => $icon
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

    echo json_encode(['success' => true, 'message' => 'Update posted successfully']);
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request.']);
    exit;
}
