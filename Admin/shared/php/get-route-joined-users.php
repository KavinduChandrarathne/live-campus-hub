<?php
// Get all users who joined a specific route via MySQL
header('Content-Type: application/json');
require_once 'db.php';

$route = isset($_GET['route']) ? trim($_GET['route']) : '';

if ($route === '') {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $pdo->prepare('
        SELECT 
            u.username,
            u.firstName,
            u.lastName,
            u.email,
            u.faculty,
            u.picture
        FROM users u
        INNER JOIN transit_route_memberships m ON u.id = m.user_id
        INNER JOIN transit_routes r ON m.route_id = r.id
        WHERE LOWER(r.name) = LOWER(:route)
        ORDER BY u.firstName, u.lastName
    ');
    $stmt->execute([':route' => $route]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($users);
    exit;
} catch (PDOException $e) {
    error_log('Get route joined users error: ' . $e->getMessage());
    echo json_encode([]);
    exit;
}
