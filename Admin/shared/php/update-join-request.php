<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $studentId = isset($_POST['studentId']) ? trim($_POST['studentId']) : null;
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : null;
    $status = isset($_POST['status']) ? trim($_POST['status']) : '';

    if (!$studentId || !$clubName || $status === '') {
        echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        exit;
    }

    try {
        // Get user
        $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(studentId) = LOWER(:studentId)');
        $stmt->execute([':studentId' => $studentId]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'User not found']);
            exit;
        }

        $userId = $user['id'];

        // Get club
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:clubName)');
        $stmt->execute([':clubName' => $clubName]);
        $club = $stmt->fetch();

        if (!$club) {
            echo json_encode(['success' => false, 'error' => 'Club not found']);
            exit;
        }

        $clubId = $club['id'];

        // Get current request
        $stmt = $pdo->prepare('
            SELECT status FROM club_join_requests 
            WHERE user_id = :userId AND club_id = :clubId
        ');
        $stmt->execute([':userId' => $userId, ':clubId' => $clubId]);
        $request = $stmt->fetch();

        $oldStatus = $request ? ($request['status'] ?? 'pending') : 'pending';

        // Check if user already has a membership
        $stmt = $pdo->prepare('
            SELECT id FROM club_memberships 
            WHERE user_id = :userId AND club_id = :clubId
        ');
        $stmt->execute([':userId' => $userId, ':clubId' => $clubId]);
        $membership = $stmt->fetch();

        // Count existing clubs before this change
        $stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM club_memberships WHERE user_id = :userId');
        $stmt->execute([':userId' => $userId]);
        $countResult = $stmt->fetch();
        $clubCount = $countResult['cnt'];

        if ($status === 'accepted' && $oldStatus !== 'accepted') {
            // Add to joined clubs if not already there
            if (!$membership) {
                $stmt = $pdo->prepare('
                    INSERT INTO club_memberships (user_id, club_id, joined_at)
                    VALUES (:userId, :clubId, NOW())
                ');
                $stmt->execute([':userId' => $userId, ':clubId' => $clubId]);
            }

            // Award points
            awardUserPoints($pdo, $userId, 20, 0, false, 'Joining a club');
            if ($clubCount === 0) {
                awardUserPoints($pdo, $userId, 10, 0, false, 'First club joined');
            }
        } elseif ($status === 'removed') {
            // Remove from joined clubs if it was accepted or if there's no pending request
            if ($membership && ($oldStatus === 'accepted' || !$request)) {
                $stmt = $pdo->prepare('DELETE FROM club_memberships WHERE user_id = :userId AND club_id = :clubId');
                $stmt->execute([':userId' => $userId, ':clubId' => $clubId]);
            }
        }

        // Update the join request status
        if ($request) {
            $stmt = $pdo->prepare('
                UPDATE club_join_requests 
                SET status = :status, updated_at = NOW()
                WHERE user_id = :userId AND club_id = :clubId
            ');
            $stmt->execute([
                ':status' => $status,
                ':userId' => $userId,
                ':clubId' => $clubId
            ]);
        }

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Update join request error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to update request']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
