<?php
// Delete a facility/event update by index
$updatesFile = '../json/facility-event-updates.json';
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
        array_splice($updates, $index, 1);
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
