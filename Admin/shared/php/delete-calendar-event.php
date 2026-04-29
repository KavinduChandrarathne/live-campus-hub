<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $eventId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

    if ($eventId === 0 || $userId === 0) {
        echo json_encode(['success' => false, 'error' => 'Event ID and User ID are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT created_by_type, created_by_id FROM calendar_events WHERE id = ?');
        $stmt->execute([$eventId]);
        $event = $stmt->fetch();

        if (!$event) {
            echo json_encode(['success' => false, 'error' => 'Event not found.']);
            exit;
        }

        $isAdmin = $event['created_by_type'] === 'admin';
        $isOwner = $event['created_by_id'] == $userId;

        if (!$isAdmin && !$isOwner) {
            echo json_encode(['success' => false, 'error' => 'You do not have permission to delete this event.']);
            exit;
        }

        if ($isAdmin && !$isOwner) {
            echo json_encode(['success' => false, 'error' => 'Only admins can delete admin-created events.']);
            exit;
        }

        $deleteStmt = $pdo->prepare('DELETE FROM calendar_events WHERE id = ?');
        $deleteStmt->execute([$eventId]);

        echo json_encode([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
        exit;
    } catch (PDOException $e) {
        error_log('Calendar event deletion error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to delete event']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}