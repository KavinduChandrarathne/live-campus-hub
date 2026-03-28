<?php
// Add a new club update to database
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : 'fa-users';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $sendNotification = isset($_POST['sendNotification']) && $_POST['sendNotification'] === 'on';

    if ($clubName === '' || $message === '') {
        echo json_encode(['success' => false, 'error' => 'Club and message are required']);
        exit;
    }

    try {
        // Find club by name
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:clubName)');
        $stmt->execute([':clubName' => $clubName]);
        $club = $stmt->fetch();

        if (!$club) {
            echo json_encode(['success' => false, 'error' => 'Club not found']);
            exit;
        }

        $clubId = $club['id'];

        // Insert club update
        $stmt = $pdo->prepare('
            INSERT INTO club_updates (club_id, icon, message, description, created_at)
            VALUES (:clubId, :icon, :message, :description, NOW())
        ');
        $stmt->execute([
            ':clubId' => $clubId,
            ':icon' => $icon,
            ':message' => $message,
            ':description' => $description ?: null
        ]);

        // If send as notification is checked, create a notification
        if ($sendNotification) {
            addNotification($pdo, 'Club Update - ' . $clubName, $message, 'club', $clubId);
        }

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Club update creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create club update']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
