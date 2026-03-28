<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-envelope';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';

    if ($message === '') {
        echo json_encode(['success' => false, 'error' => 'Message is required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO facility_event_updates (icon, message, description, created_at)
            VALUES (:icon, :message, :description, NOW())
        ');
        $stmt->execute([':icon' => $icon, ':message' => $message, ':description' => $description ?: null]);

        if ($sendNotification) {
            addNotification($pdo, 'Facility & Event Update', $message, 'facility');
        }

        echo json_encode(['success' => true, 'message' => 'Update posted successfully']);
        exit;
    } catch (PDOException $e) {
        error_log('Facility event creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create update']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request.']);
    exit;
}
