<?php
header('Content-Type: application/json');
require_once 'db.php';

$route = isset($_GET['route']) ? trim($_GET['route']) : '';

if ($route === '') {
    echo json_encode([]);
    exit;
}

try {
    // Find route (case-insensitive)
    $routeLower = strtolower($route);
    $stmt = $pdo->prepare('SELECT id FROM transit_routes WHERE LOWER(name) = ?');
    $stmt->execute([$routeLower]);
    $routeRow = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$routeRow) {
        echo json_encode([]);
        exit;
    }

    // Get all updates for this route
    $stmt = $pdo->prepare('
        SELECT icon, message, description, live_link, created_by_username, created_at as datetime
        FROM transit_updates 
        WHERE route_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$routeRow['id']]);
    $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add route name to each update for frontend compatibility
    foreach ($updates as &$u) {
        $u['route'] = $route;
        if (!$u['live_link']) {
            $u['liveLink'] = '';
        } else {
            $u['liveLink'] = $u['live_link'];
        }
        unset($u['live_link']);
    }

    echo json_encode($updates);
} catch (PDOException $e) {
    error_log('Get transit updates error: ' . $e->getMessage());
    echo json_encode([]);
}
?>
