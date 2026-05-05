<?php
header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/../php/db.php';

// Get the JSON data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing alert ID']);
    exit;
}

$alertId = htmlspecialchars($input['id']);

try {
    // Update the alert status to resolved
    $stmt = $pdo->prepare("
        UPDATE emergency_alerts
        SET status = 'resolved', resolved_at = NOW()
        WHERE id = ?
    ");

    $result = $stmt->execute([$alertId]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Alert marked as resolved']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Alert not found or already resolved']);
    }

} catch (Exception $e) {
    error_log('Emergency alert resolution error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to resolve alert']);
}
?>
?>
