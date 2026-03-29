<?php
// Delete a club update from database
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;

    if ($clubName === '' || $index < 0) {
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

        $updateIdToDelete = $updates[$index];

        // Delete the update
        $stmt = $pdo->prepare('DELETE FROM club_updates WHERE id = :id');
        $stmt->execute([':id' => $updateIdToDelete]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Delete club update error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to delete update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
