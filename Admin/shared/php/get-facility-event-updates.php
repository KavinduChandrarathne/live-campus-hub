<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->prepare('
        SELECT icon, message, description, created_at as datetime
        FROM facility_event_updates 
        ORDER BY created_at DESC
    ');
    $stmt->execute();
    $updates = $stmt->fetchAll();

    echo json_encode($updates);
} catch (PDOException $e) {
    error_log('Get facility updates error: ' . $e->getMessage());
    echo json_encode([]);
}