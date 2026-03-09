<?php
date_default_timezone_set('Asia/Colombo'); // Set Sri Lanka timezone
// Edit a facility/event update by index
$updatesFile = '../json/facility-event-updates.json';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $icon = isset($_POST['icon']) ? $_POST['icon'] : '';
    $message = isset($_POST['message']) ? $_POST['message'] : '';
    $description = isset($_POST['description']) ? $_POST['description'] : '';
    if ($index < 0 || !$icon || !$message) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }
    $updates = [];
    if (file_exists($updatesFile)) {
        $json = file_get_contents($updatesFile);
        $updates = json_decode($json, true);
        if (!is_array($updates)) $updates = [];
    }
    if ($index >= 0 && $index < count($updates)) {
        $updates[$index]['icon'] = $icon;
        $updates[$index]['message'] = $message;
        $updates[$index]['description'] = $description;
        $updates[$index]['datetime'] = date('Y-m-d H:i:s');
        file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Index out of range']);
    }
    exit;
}
// Invalid request
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
