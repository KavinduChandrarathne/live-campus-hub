<?php
// API endpoint to get current user data from MySQL
header('Content-Type: application/json');
require_once 'db.php';

$email = isset($_GET['email']) ? trim($_GET['email']) : '';

if (!$email) {
    echo json_encode([]);
    exit;
}

try {
    // Look up user by email
    $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode([]);
        exit;
    }

    // Get full user data with rewards and memberships
    $fullUser = getUserWithMemberships($pdo, $user['id']);

    echo json_encode($fullUser);
    exit;

} catch (PDOException $e) {
    error_log('Get user error: ' . $e->getMessage());
    echo json_encode([]);
    exit;
}
