<?php
// Path to the shared notifications.json file
$notificationsFile = '../../shared/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    // Validate
    if ($title === '' || $message === '') {
        echo 'Title and message are required.';
        exit;
    }

    // Create notification array
    $notification = [
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

    // Redirect back to the form or show success
    header('Location: ../add-notification.html?success=1');
    exit;
} else {
    echo 'Invalid request.';
    exit;
}
