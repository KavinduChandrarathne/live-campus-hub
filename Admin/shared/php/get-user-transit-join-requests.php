<?php
// Get user's pending transit join requests via MySQL
header('Content-Type: application/json');
require_once 'db.php';

$username = isset($_GET['username']) ? trim($_GET['username']) : '';

if ($username === '') {
    echo json_encode([]);
    exit;
}

try {
    // Find user by username or email
    $stmt = $pdo->prepare('
        SELECT id FROM users
        WHERE LOWER(username) = ? OR LOWER(email) = ?
    ');
    $usernameLower = strtolower($username);
    $stmt->execute([$usernameLower, $usernameLower]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([]);
        exit;
    }

    // Get user's pending transit join requests
    $stmt = $pdo->prepare('
        SELECT 
            tjr.id,
            r.name as route,
            tjr.status,
            tjr.created_at
        FROM transit_join_requests tjr
        JOIN transit_routes r ON tjr.route_id = r.id
        WHERE tjr.user_id = ? AND tjr.status = ?
        ORDER BY tjr.created_at DESC
    ');
    $stmt->execute([$user['id'], 'pending']);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($requests);
    exit;
} catch (PDOException $e) {
    error_log('Get user transit requests error: ' . $e->getMessage());
    echo json_encode([]);
    exit;
}
?>
