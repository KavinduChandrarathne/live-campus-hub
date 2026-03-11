<?php
// Add a new club-specific update to JSON
date_default_timezone_set('Asia/Colombo');
$updatesFile = '../json/club-updates.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $club = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-users';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

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

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
