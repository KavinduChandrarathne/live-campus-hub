<?php
// Edit a facility/event update by index via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    if ($index < 0 || !$icon || !$message) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
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

        // Update the facility event update
        $stmt = $pdo->prepare('
            UPDATE facility_event_updates 
            SET icon = :icon, message = :message, description = :description, updated_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':icon' => $icon,
            ':message' => $message,
            ':description' => $description,
            ':id' => $updateId
        ]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Edit facility event error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
