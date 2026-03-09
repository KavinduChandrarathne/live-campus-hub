<?php
header('Content-Type: application/json');
$notificationsFile = '../json/notifications.json';
if (file_exists($notificationsFile)) {
    echo file_get_contents($notificationsFile);
} else {
    echo json_encode([]);
}
?>