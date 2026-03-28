<?php
header('Content-Type: application/json');
require_once 'db.php';

$studentId = isset($_GET['studentId']) ? trim($_GET['studentId']) : '';

try {
    // Get user's club memberships if studentId provided
    $userClubs = [];
    if ($studentId) {
        $stmt = $pdo->prepare('
            SELECT c.id, c.name
            FROM club_memberships cm
            JOIN clubs c ON cm.club_id = c.id
            JOIN users u ON cm.user_id = u.id
            WHERE LOWER(u.studentId) = LOWER(:studentId)
        ');
        $stmt->execute([':studentId' => $studentId]);
        $clubs = $stmt->fetchAll();
        foreach ($clubs as $club) {
            $userClubs[] = strtolower($club['name']);
        }
    }

    // Get notifications
    $stmt = $pdo->prepare('
        SELECT id, type, title, message, club_id, created_at as datetime
        FROM notifications 
        ORDER BY created_at DESC
    ');
    $stmt->execute();
    $notifications = $stmt->fetchAll();

    // Filter based on type
    $filtered = [];
    foreach ($notifications as $notif) {
        if ($notif['type'] === 'club' && $notif['club_id']) {
            // Only show club notifications if user is a member
            $stmt = $pdo->prepare('SELECT name FROM clubs WHERE id = :id');
            $stmt->execute([':id' => $notif['club_id']]);
            $club = $stmt->fetch();
            if ($club && in_array(strtolower($club['name']), $userClubs)) {
                $filtered[] = $notif;
            }
        } else {
            // Always show direct and facility notifications
            $filtered[] = $notif;
        }
    }

    echo json_encode($filtered);
} catch (PDOException $e) {
    error_log('Get notifications error: ' . $e->getMessage());
    echo json_encode([]);
}
