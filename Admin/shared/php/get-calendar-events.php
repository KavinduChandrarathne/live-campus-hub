<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $isAdmin = isset($_GET['is_admin']) && $_GET['is_admin'] === 'true';
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;
    $category = isset($_GET['category']) ? trim($_GET['category']) : 'all';

    if ($userId === 0) {
        echo json_encode(['success' => false, 'error' => 'User ID is required.']);
        exit;
    }

    try {
        // For admin, return ALL events without month/year filtering
        if ($isAdmin) {
            $sql = '
                SELECT e.id, e.created_by_type, e.created_by_id, e.club_id, e.title, e.description, e.event_date, 
                       e.start_time, e.end_time, e.category, e.created_at,
                       c.name as club_name
                FROM calendar_events e
                LEFT JOIN clubs c ON e.club_id = c.id
            ';
            $params = [];

            if ($category !== 'all') {
                $sql .= ' WHERE e.category = :category';
                $params[':category'] = $category;
            }

            $sql .= ' ORDER BY e.event_date ASC, e.start_time ASC';

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $allEvents = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'events' => $allEvents
            ]);
            exit;
        }

        // For regular users, apply month/year filtering
        $sql = '
            SELECT e.id, e.created_by_type, e.created_by_id, e.club_id, e.title, e.description, e.event_date, 
                   e.start_time, e.end_time, e.category, e.created_at,
                   c.name as club_name
            FROM calendar_events e
            LEFT JOIN clubs c ON e.club_id = c.id
            WHERE 1=1
        ';
        $params = [];

        if ($category !== 'all') {
            $sql .= ' AND e.category = :category';
            $params[':category'] = $category;
        }

        if ($month !== null && $year !== null) {
            $sql .= ' AND MONTH(e.event_date) = :month AND YEAR(e.event_date) = :year';
            $params[':month'] = $month;
            $params[':year'] = $year;
        }

        $sql .= ' ORDER BY e.event_date ASC, e.start_time ASC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $allEvents = $stmt->fetchAll();

        // For regular users, apply filtering logic
        $filteredEvents = [];
        foreach ($allEvents as $event) {
            $isAdminEvent = $event['created_by_type'] === 'admin';
            $hasClub = $event['club_id'] !== null;

            // Admin events are visible to all users (either no club, or user is club member)
            if ($isAdminEvent) {
                if (!$hasClub) {
                    // Admin event with no specific club - visible to all
                    $filteredEvents[] = $event;
                } else {
                    // Admin event for specific club - check membership
                    $stmt = $pdo->prepare('
                        SELECT COUNT(*) as cnt 
                        FROM club_memberships 
                        WHERE user_id = :user_id AND club_id = :club_id
                    ');
                    $stmt->execute([':user_id' => $userId, ':club_id' => $event['club_id']]);
                    $member = $stmt->fetch();
                    if ($member && $member['cnt'] > 0) {
                        $filteredEvents[] = $event;
                    }
                }
            } elseif (!$hasClub) {
                // User's own event (not admin) with no club - visible to creator
                if ($event['created_by_id'] == $userId) {
                    $filteredEvents[] = $event;
                }
            } else {
                // Club event created by regular user - check membership
                $stmt = $pdo->prepare('
                    SELECT COUNT(*) as cnt 
                    FROM club_memberships 
                    WHERE user_id = :user_id AND club_id = :club_id
                ');
                $stmt->execute([':user_id' => $userId, ':club_id' => $event['club_id']]);
                $member = $stmt->fetch();
                if ($member && $member['cnt'] > 0) {
                    $filteredEvents[] = $event;
                }
            }
        }

        echo json_encode([
            'success' => true,
            'events' => $filteredEvents
        ]);
        exit;
    } catch (PDOException $e) {
        error_log('Calendar events fetch error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to fetch events']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}