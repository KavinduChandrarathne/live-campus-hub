<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->prepare('
        SELECT 
            u.firstName,
            u.lastName,
            u.studentId,
            u.picture,
            c.name as clubName,
            cjr.message,
            cjr.status,
            cjr.created_at as datetime
        FROM club_join_requests cjr
        JOIN users u ON cjr.user_id = u.id
        JOIN clubs c ON cjr.club_id = c.id
        ORDER BY cjr.created_at DESC
    ');
    $stmt->execute();
    $joins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format name for consistency with frontend
    foreach ($joins as &$j) {
        $j['name'] = trim($j['firstName'] . ' ' . $j['lastName']);
    }

    echo json_encode($joins);
} catch (PDOException $e) {
    error_log('Get join requests error: ' . $e->getMessage());
    echo json_encode([]);
}
?>
