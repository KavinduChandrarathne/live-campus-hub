<?php
// Delete a facility/event update by index via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    if ($index < 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid index']);
        exit;
    }

    try {
        // Get all facility event updates ordered by date (newest first)
        $stmt = $pdo->prepare('SELECT id FROM facility_event_updates ORDER BY created_at DESC');
        $stmt->execute();
        $updates = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

        if ($index >= count($updates)) {
            echo json_encode(['success' => false, 'error' => 'Index out of range']);
            exit;
        }

        $updateId = $updates[$index];

        // Delete the update
        $stmt = $pdo->prepare('DELETE FROM facility_event_updates WHERE id = :id');
        $stmt->execute([':id' => $updateId]);

        // Delete corresponding notifications of type 'facility'
        $stmt = $pdo->prepare('DELETE FROM notifications WHERE type = :type AND facility_event_id = :eventId');
        $stmt->execute([':type' => 'facility', ':eventId' => $updateId]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Delete facility event error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to delete update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
