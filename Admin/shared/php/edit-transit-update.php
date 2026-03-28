<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $liveLink = isset($_POST['liveLink']) ? trim($_POST['liveLink']) : '';

    if ($route === '' || $index < 0 || !$icon || !$message) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT id FROM transit_routes WHERE LOWER(name) = LOWER(:route)');
        $stmt->execute([':route' => $route]);
        $routeRow = $stmt->fetch();

        if (!$routeRow) {
            echo json_encode(['success' => false, 'error' => 'Route not found']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id FROM transit_updates WHERE route_id = :routeId ORDER BY created_at DESC');
        $stmt->execute([':routeId' => $routeRow['id']]);
        $updates = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

        if ($index >= count($updates)) {
            echo json_encode(['success' => false, 'error' => 'Update not found']);
            exit;
        }

        $updateId = $updates[$index];

        $stmt = $pdo->prepare('
            UPDATE transit_updates 
            SET icon = :icon, message = :message, description = :description, live_link = :liveLink, created_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([':icon' => $icon, ':message' => $message, ':description' => $description ?: null, ':liveLink' => $liveLink ?: null, ':id' => $updateId]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Edit transit update error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to edit update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
