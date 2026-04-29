<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $eventId = isset($_POST['event_id']) ? intval($_POST['event_id']) : 0;
    $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $isAdmin = isset($_POST['is_admin']) && $_POST['is_admin'] === 'true';

    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $eventDate = isset($_POST['event_date']) ? trim($_POST['event_date']) : '';
    $startTime = isset($_POST['start_time']) ? trim($_POST['start_time']) : '';
    $endTime = isset($_POST['end_time']) ? trim($_POST['end_time']) : '';
    $location = isset($_POST['location']) ? trim($_POST['location']) : '';
    $category = isset($_POST['category']) ? trim($_POST['category']) : '';
    $clubId = isset($_POST['club_id']) && $_POST['club_id'] !== '' ? intval($_POST['club_id']) : null;
    $reminderMinutes = isset($_POST['reminder_minutes']) ? intval($_POST['reminder_minutes']) : 30;

    if ($eventId === 0 || $userId === 0 || $title === '' || $eventDate === '' || $startTime === '' || $endTime === '') {
        echo json_encode(['success' => false, 'error' => 'Event ID, user ID, title, date, and time are required.']);
        exit;
    }

    $iconMap = [
        'personal' => 'fa-user',
        'meeting' => 'fa-users',
        'event' => 'fa-star',
        'other' => 'fa-calendar',
        'lecture' => 'fa-chalkboard-user',
        'exam' => 'fa-pencil',
        'workshop' => 'fa-person-chalkboard',
        'notice' => 'fa-bell'
    ];
    $icon = isset($iconMap[$category]) ? $iconMap[$category] : 'fa-calendar';

    try {
        if ($isAdmin) {
            $stmt = $pdo->prepare('
                UPDATE calendar_events 
                SET title = :title, description = :description, event_date = :event_date, 
                    start_time = :start_time, end_time = :end_time, location = :location,
                    category = :category, icon = :icon, club_id = :club_id, reminder_minutes = :reminder_minutes,
                    updated_at = NOW()
                WHERE id = :event_id
            ');
            $stmt->execute([
                ':title' => $title,
                ':description' => $description,
                ':event_date' => $eventDate,
                ':start_time' => $startTime,
                ':end_time' => $endTime,
                ':location' => $location,
                ':category' => $category,
                ':icon' => $icon,
                ':club_id' => $clubId,
                ':reminder_minutes' => $reminderMinutes,
                ':event_id' => $eventId
            ]);
        } else {
            $stmt = $pdo->prepare('
                UPDATE calendar_events 
                SET title = :title, description = :description, event_date = :event_date, 
                    start_time = :start_time, end_time = :end_time, location = :location,
                    category = :category, icon = :icon, reminder_minutes = :reminder_minutes,
                    updated_at = NOW()
                WHERE id = :event_id AND created_by_type = "user" AND created_by_id = :user_id
            ');
            $stmt->execute([
                ':title' => $title,
                ':description' => $description,
                ':event_date' => $eventDate,
                ':start_time' => $startTime,
                ':end_time' => $endTime,
                ':location' => $location,
                ':category' => $category,
                ':icon' => $icon,
                ':reminder_minutes' => $reminderMinutes,
                ':event_id' => $eventId,
                ':user_id' => $userId
            ]);
        }

        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'error' => 'Event not found or you do not have permission to edit it.']);
            exit;
        }

        echo json_encode(['success' => true, 'message' => 'Event updated successfully']);
        exit;
    } catch (PDOException $e) {
        error_log('Update calendar event error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to update event']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request.']);
    exit;
}