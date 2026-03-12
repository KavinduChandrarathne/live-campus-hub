<?php
header('Content-Type: application/json');
// Edit a club update by index within its club's list
$updatesFile = '../json/club-updates.json';
$notificationsFile = '../json/notifications.json';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $club = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $icon = isset($_POST['icon']) ? $_POST['icon'] : '';
    $message = isset($_POST['message']) ? $_POST['message'] : '';
    $description = isset($_POST['description']) ? $_POST['description'] : '';
    if ($club === '' || $index < 0 || !$icon || !$message) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }
    $updates = [];
    if (file_exists($updatesFile)) {
        $json = file_get_contents($updatesFile);
        $updates = json_decode($json, true);
        if (!is_array($updates)) $updates = [];
    }
    // find the nth update for this club
    $count = -1;
    foreach ($updates as $k => $u) {
        if (isset($u['clubName']) && strcasecmp(trim($u['clubName']), $club) === 0) {
            $count++;
            if ($count === $index) {
                $updates[$k]['icon'] = $icon;
                $updates[$k]['message'] = $message;
                $updates[$k]['description'] = $description;
                $updates[$k]['datetime'] = date('Y-m-d H:i:s');
                file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true]);
                exit;
            }
        }
    }
    echo json_encode(['success' => false, 'error' => 'Update not found']);
    exit;
}
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
