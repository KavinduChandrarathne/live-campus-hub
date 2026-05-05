<?php
header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/../php/db.php';

try {
    // Query to get active emergency alerts that haven't expired
    $stmt = $pdo->prepare("
        SELECT
            id,
            title,
            type,
            location,
            description,
            severity,
            instructions,
            active_until as activeUntil,
            created_at as createdAt,
            status
        FROM emergency_alerts
        WHERE status = 'active'
        AND active_until > NOW()
        ORDER BY created_at DESC
    ");

    $stmt->execute();
    $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'alerts' => $alerts]);

} catch (Exception $e) {
    error_log('Emergency alerts retrieval error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to retrieve emergency alerts']);
}
?>
