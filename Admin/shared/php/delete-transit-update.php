<?php
// Delete a transit update by route and index
$updatesFile = '../json/transit-updates.json';
$notificationsFile = '../json/notifications.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    if ($route === '' || $index < 0) {
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
        if (isset($u['route']) && strcasecmp(trim($u['route']), $route) === 0) {
            $count++;
            if ($count === $index) {
                $deletedUpdate = $u;
                array_splice($updates, $k, 1);
                file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));

                // optionally remove corresponding notification
                if (isset($deletedUpdate['message']) && isset($deletedUpdate['datetime'])) {
                    $notifications = [];
                    if (file_exists($notificationsFile)) {
                        $json = file_get_contents($notificationsFile);
                        $notifications = json_decode($json, true);
                        if (!is_array($notifications)) $notifications = [];
                    }
                    foreach ($notifications as $notifIdx => $notif) {
                        if (isset($notif['type']) && $notif['type'] === 'transit' &&
                            isset($notif['message']) && $notif['message'] === $deletedUpdate['message'] &&
                            isset($notif['datetime']) && $notif['datetime'] === $deletedUpdate['datetime']) {
                            array_splice($notifications, $notifIdx, 1);
                            break;
                        }
                    }
                    file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));
                }

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
