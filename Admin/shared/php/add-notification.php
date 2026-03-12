<?php
header('Content-Type: application/json');

// Path to the shared notifications.json file
$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $type = isset($_POST['type']) ? trim($_POST['type']) : 'direct';

    // Validate
    if ($title === '' || $message === '') {
        echo json_encode(['success' => false, 'error' => 'Title and message are required.']);
        exit;
    }

    // Create notification array
    $notification = [
        'id' => uniqid('notif_'),
        'type' => $type,
        'title' => $title,
        'message' => $message,
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

    echo json_encode(['success' => true, 'message' => 'Notification sent successfully']);
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request.']);
    exit;
}
?>
