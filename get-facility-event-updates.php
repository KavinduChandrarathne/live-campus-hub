<?php
header('Content-Type: application/json');
$updatesFile = 'shared/facility-event-updates.json';
if (file_exists($updatesFile)) {
    echo file_get_contents($updatesFile);
} else {
    echo json_encode([]);
}
?>