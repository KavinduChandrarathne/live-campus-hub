<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $type = isset($_POST['type']) ? trim($_POST['type']) : 'direct';

    if ($title === '' || $message === '') {
        echo json_encode(['success' => false, 'error' => 'Title and message are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO notifications (type, title, message, created_at)
            VALUES (:type, :title, :message, NOW())
        ');
        $stmt->execute([':type' => $type, ':title' => $title, ':message' => $message]);

        echo json_encode(['success' => true, 'message' => 'Notification sent successfully']);
        exit;
    } catch (PDOException $e) {
        error_log('Notification creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create notification']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request.']);
    exit;
}
