<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $icon = isset($_POST['icon']) ? $_POST['icon'] : '';
    $message = isset($_POST['message']) ? $_POST['message'] : '';
    $description = isset($_POST['description']) ? $_POST['description'] : '';

    if ($clubName === '' || $index < 0 || !$icon || !$message) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    try {
        // Find club
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:clubName)');
        $stmt->execute([':clubName' => $clubName]);
        $club = $stmt->fetch();

        if (!$club) {
            echo json_encode(['success' => false, 'error' => 'Club not found']);
            exit;
        }

        // Get all updates for this club, ordered by date
        $stmt = $pdo->prepare('
            SELECT id FROM club_updates 
            WHERE club_id = :clubId
            ORDER BY created_at DESC
        ');
        $stmt->execute([':clubId' => $club['id']]);
        $updates = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

        if ($index >= count($updates)) {
            echo json_encode(['success' => false, 'error' => 'Update not found']);
            exit;
        }

        $updateId = $updates[$index];

        // Update the club update
        $stmt = $pdo->prepare('
            UPDATE club_updates 
            SET icon = :icon, message = :message, description = :description, created_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':icon' => $icon,
            ':message' => $message,
            ':description' => $description ?: null,
            ':id' => $updateId
        ]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Edit club update error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to edit update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
