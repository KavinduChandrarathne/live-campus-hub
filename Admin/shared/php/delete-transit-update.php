<?php
// Delete a transit update via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;

    if ($route === '' || $index < 0) {
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
        $stmt = $pdo->prepare('DELETE FROM transit_updates WHERE id = :id');
        $stmt->execute([':id' => $updateId]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Delete transit update error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to delete update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
