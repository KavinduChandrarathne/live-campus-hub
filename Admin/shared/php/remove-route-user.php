<?php
// Remove user from transit route via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$route = isset($_POST['route']) ? trim($_POST['route']) : '';
$user = isset($_POST['username']) ? trim($_POST['username']) : '';

if ($route === '' || $user === '') {
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit;
}

try {
    // Find user by username or email
    $userLower = strtolower($user);
    $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?');
    $stmt->execute([$userLower, $userLower]);
    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userRow) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    // Find route by name
    $routeLower = strtolower($route);
    $stmt = $pdo->prepare('SELECT id FROM transit_routes WHERE LOWER(name) = ?');
    $stmt->execute([$routeLower]);
    $routeRow = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$routeRow) {
        echo json_encode(['success' => false, 'error' => 'Route not found']);
        exit;
    }

    // Remove from memberships
    $stmt = $pdo->prepare('DELETE FROM transit_route_memberships WHERE user_id = ? AND route_id = ?');
    $stmt->execute([$userRow['id'], $routeRow['id']]);

    // Mark any prior join requests as rejected so user can request again
    $stmt = $pdo->prepare('UPDATE transit_join_requests SET status = ? WHERE user_id = ? AND route_id = ?');
    $stmt->execute(['rejected', $userRow['id'], $routeRow['id']]);

    echo json_encode(['success' => true]);
    exit;
} catch (PDOException $e) {
    error_log('Remove route user error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to remove user']);
    exit;
}
