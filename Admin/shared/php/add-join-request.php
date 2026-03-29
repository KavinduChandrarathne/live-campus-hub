<?php
// Add a new club join request to database
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $studentId = isset($_POST['studentId']) ? trim($_POST['studentId']) : '';
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if ($studentId === '' || $clubName === '') {
        echo json_encode(['success' => false, 'error' => 'Required fields missing']);
        exit;
    }

    try {
        // Get user by studentId
        $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(studentId) = LOWER(:studentId)');
        $stmt->execute([':studentId' => $studentId]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'Unknown student ID']);
            exit;
        }

        $userId = $user['id'];

        // Get club by name
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:clubName)');
        $stmt->execute([':clubName' => $clubName]);
        $club = $stmt->fetch();

        if (!$club) {
            echo json_encode(['success' => false, 'error' => 'Club not found']);
            exit;
        }

        $clubId = $club['id'];

        // Check for existing request
        $stmt = $pdo->prepare('
            SELECT status FROM club_join_requests 
            WHERE user_id = :userId AND club_id = :clubId
        ');
        $stmt->execute([':userId' => $userId, ':clubId' => $clubId]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($existing['status'] === 'pending' || $existing['status'] === 'accepted') {
                echo json_encode(['success' => false, 'error' => 'Duplicate request']);
                exit;
            }
        }

        // Insert new request
        $stmt = $pdo->prepare('
            INSERT INTO club_join_requests (user_id, club_id, message, status, created_at)
            VALUES (:userId, :clubId, :message, "pending", NOW())
        ');
        $stmt->execute([
            ':userId' => $userId,
            ':clubId' => $clubId,
            ':message' => $message ?: null
        ]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Join request creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create request']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
