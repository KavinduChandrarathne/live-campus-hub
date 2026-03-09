<?php
date_default_timezone_set('Asia/Colombo'); // Set Sri Lanka timezone
// Path to the shared facility-event-updates.json file
$updatesFile = '../../shared/facility-event-updates.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-envelope';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    // Validate
    if ($message === '') {
        echo 'Message is required.';
        exit;
    }

    // Create update array
    $update = [
        'icon' => $icon,
        'message' => $message,
        'description' => $description,
        'datetime' => date('Y-m-d H:i:s')
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

    // Redirect back to the form or show success
    header('Location: ../facility-event-admin.html?success=1');
    exit;
} else {
    echo 'Invalid request.';
    exit;
}
