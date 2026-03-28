<?php
// Get all transit join requests with user details via MySQL
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->prepare('
        SELECT 
            tjr.id,
            u.username,
            u.email,
            u.firstName,
            u.lastName,
            u.faculty,
            u.picture,
            r.name as route,
            tjr.status,
            tjr.created_at
        FROM transit_join_requests tjr
        JOIN users u ON tjr.user_id = u.id
        JOIN transit_routes r ON tjr.route_id = r.id
        ORDER BY tjr.created_at DESC
    ');
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response for frontend compatibility
    $response = [];
    foreach ($requests as $r) {
        $response[] = [
            'id' => $r['id'],
            'username' => $r['username'],
            'email' => $r['email'] ?? '',
            'firstName' => $r['firstName'] ?? '',
            'lastName' => $r['lastName'] ?? '',
            'faculty' => $r['faculty'] ?? '',
            'picture' => $r['picture'] ?? '',
            'route' => $r['route'],
            'status' => $r['status'],
            'created_at' => $r['created_at'] ?? ''
        ];
    }

    echo json_encode($response);
    exit;
} catch (PDOException $e) {
    error_log('Get transit join requests error: ' . $e->getMessage());
    echo json_encode([]);
    exit;
}
?>
