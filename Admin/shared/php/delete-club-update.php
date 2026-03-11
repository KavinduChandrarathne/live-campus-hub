<?php
// Delete a club update by index within its club's entries
$updatesFile = '../json/club-updates.json';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $club = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    if ($club === '' || $index < 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }
    $updates = [];
    if (file_exists($updatesFile)) {
        $json = file_get_contents($updatesFile);
        $updates = json_decode($json, true);
        if (!is_array($updates)) $updates = [];
    }
    $count = -1;
    foreach ($updates as $k => $u) {
        if (isset($u['clubName']) && strcasecmp(trim($u['clubName']), $club) === 0) {
            $count++;
            if ($count === $index) {
                array_splice($updates, $k, 1);
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
