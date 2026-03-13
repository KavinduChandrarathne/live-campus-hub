<?php
header('Content-Type: application/json');
// Edit a transit update by route and index
$updatesFile = '../json/transit-updates.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $liveLink = isset($_POST['liveLink']) ? trim($_POST['liveLink']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';
    if ($route === '' || $index < 0 || !$icon || !$message) {
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
                $updates[$k]['icon'] = $icon;
                $updates[$k]['message'] = $message;
                $updates[$k]['description'] = $description;
                $updates[$k]['liveLink'] = $liveLink;
                $updates[$k]['datetime'] = date('Y-m-d H:i:s');
                file_put_contents($updatesFile, json_encode($updates, JSON_PRETTY_PRINT));

                // if requested, add a new notification for this update
                if ($sendNotification) {
                    $notificationsFile = '../json/notifications.json';
                    $notification = [
                        'id' => uniqid('notif_'),
                        'type' => 'transit',
                        'title' => 'Transit Update - ' . $route,
                        'message' => $message,
                        'description' => $description,
                        'route' => $route,
                        'datetime' => date('Y-m-d H:i:s')
                    ];
                    $notifications = [];
                    if (file_exists($notificationsFile)) {
                        $jsonNotif = file_get_contents($notificationsFile);
                        $notifications = json_decode($jsonNotif, true);
                        if (!is_array($notifications)) {
                            $notifications = [];
                        }
                    }
                    array_unshift($notifications, $notification);
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
