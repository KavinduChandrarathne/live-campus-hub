<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $eventDate = isset($_POST['event_date']) ? trim($_POST['event_date']) : '';
    $startTime = isset($_POST['start_time']) ? trim($_POST['start_time']) : '';
    $endTime = isset($_POST['end_time']) ? trim($_POST['end_time']) : '';
    $category = isset($_POST['category']) ? trim($_POST['category']) : 'personal';
    $clubId = isset($_POST['club_id']) && $_POST['club_id'] !== '' && $_POST['club_id'] !== null ? intval($_POST['club_id']) : null;
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $isAdminEvent = isset($_POST['is_admin_event']) && $_POST['is_admin_event'] == '1';

    // Determine creator type and ID based on is_admin_event flag
    $createdByType = $isAdminEvent ? 'admin' : 'user';
    $createdById = $userId;

    if ($title === '' || $eventDate === '' || $startTime === '' || $createdById === 0) {
        echo json_encode(['success' => false, 'error' => 'Title, date, time, and creator ID are required.']);
        exit;
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $eventDate)) {
        echo json_encode(['success' => false, 'error' => 'Invalid date format. Use YYYY-MM-DD.']);
        exit;
    }

    if (!preg_match('/^\d{2}:\d{2}$/', $startTime)) {
        echo json_encode(['success' => false, 'error' => 'Invalid time format. Use HH:MM.']);
        exit;
    }

    // Valid categories from database schema
    $validCategories = ['personal', 'meeting', 'event', 'other', 'lecture', 'exam', 'workshop', 'notice'];
    if (!in_array($category, $validCategories)) {
        $category = 'personal';
    }

    if ($clubId !== null) {
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE id = ?');
        $stmt->execute([$clubId]);
        if (!$stmt->fetch()) {
            $clubId = null;
        }
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO calendar_events (club_id, title, description, event_date, start_time, end_time, category, created_by_type, created_by_id, created_at)
            VALUES (:club_id, :title, :description, :event_date, :start_time, :end_time, :category, :created_by_type, :created_by_id, NOW())
        ');
        $stmt->execute([
            ':club_id' => $clubId,
            ':title' => $title,
            ':description' => $description,
            ':event_date' => $eventDate,
            ':start_time' => $startTime,
            ':end_time' => $endTime ?: null,
            ':category' => $category,
            ':created_by_type' => $createdByType,
            ':created_by_id' => $createdById
        ]);

        $eventId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Event created successfully',
            'event_id' => $eventId
        ]);
        exit;
    } catch (PDOException $e) {
        error_log('Calendar event creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create event']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}