<?php
// Add a new transit update via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-bus';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $liveLink = isset($_POST['liveLink']) ? trim($_POST['liveLink']) : '';
    $userName = isset($_POST['userName']) ? trim($_POST['userName']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';

    if ($route === '' || $message === '') {
        echo json_encode(['success' => false, 'error' => 'Route and message are required']);
        exit;
    }
    if ($userName === '') {
        echo json_encode(['success' => false, 'error' => 'User name is required']);
        exit;
    }

    try {
        // Find or create route
        $stmt = $pdo->prepare('SELECT id FROM transit_routes WHERE LOWER(name) = LOWER(:route)');
        $stmt->execute([':route' => $route]);
        $routeRow = $stmt->fetch();

        if (!$routeRow) {
            $stmt = $pdo->prepare('INSERT INTO transit_routes (name) VALUES (:name)');
            $stmt->execute([':name' => $route]);
            $routeId = $pdo->lastInsertId();
        } else {
            $routeId = $routeRow['id'];
        }

        // Insert transit update
        $stmt = $pdo->prepare('
            INSERT INTO transit_updates (route_id, icon, message, description, live_link, created_by_username, created_at)
            VALUES (:routeId, :icon, :message, :description, :liveLink, :userName, NOW())
        ');
        $stmt->execute([
            ':routeId' => $routeId,
            ':icon' => $icon,
            ':message' => $message,
            ':description' => $description ?: null,
            ':liveLink' => $liveLink ?: null,
            ':userName' => $userName
        ]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Transit update creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
