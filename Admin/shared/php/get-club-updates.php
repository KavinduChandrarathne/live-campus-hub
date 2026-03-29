<?php
header('Content-Type: application/json');
require_once 'db.php';

$clubName = isset($_GET['club']) ? trim($_GET['club']) : '';

if ($clubName === '') {
    echo json_encode([]);
    exit;
}

try {
    // Find club
    $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:clubName)');
    $stmt->execute([':clubName' => $clubName]);
    $club = $stmt->fetch();

    if (!$club) {
        echo json_encode([]);
        exit;
    }

    // Get all updates for this club
    $stmt = $pdo->prepare('
        SELECT icon, message, description, created_at as datetime
        FROM club_updates 
        WHERE club_id = :clubId
        ORDER BY created_at DESC
    ');
    $stmt->execute([':clubId' => $club['id']]);
    $updates = $stmt->fetchAll();

    // Add clubName to each update for frontend compatibility
    foreach ($updates as &$u) {
        $u['clubName'] = $clubName;
    }

    echo json_encode($updates);
} catch (PDOException $e) {
    error_log('Get club updates error: ' . $e->getMessage());
    echo json_encode([]);
}
