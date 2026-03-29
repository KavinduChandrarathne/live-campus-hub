<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $notifId = isset($_POST['id']) ? trim($_POST['id']) : '';

    if ($notifId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid notification ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM notifications WHERE id = :id');
        $stmt->execute([':id' => $notifId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Notification not found']);
        }
        exit;
    } catch (PDOException $e) {
        error_log('Delete notification error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete notification']);
        exit;
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
