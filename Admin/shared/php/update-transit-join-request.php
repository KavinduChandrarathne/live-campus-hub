<?php
// Update transit join request (accept/reject) via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $action = isset($_POST['action']) ? trim($_POST['action']) : '';

    if ($id === '' || !in_array($action, ['accept', 'reject'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        exit;
    }

    try {
        // Find the request with user and route details
        $stmt = $pdo->prepare('
            SELECT tjr.id, tjr.user_id, tjr.route_id, tjr.status
            FROM transit_join_requests tjr
            WHERE tjr.id = ? AND (tjr.status = "pending" OR tjr.status = "")
        ');
        $stmt->execute([$id]);
        $request = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$request) {
            echo json_encode(['success' => false, 'error' => 'Request not found or already handled']);
            exit;
        }

        $userId = $request['user_id'];
        $routeId = $request['route_id'];

        // Update status
        $newStatus = ($action === 'accept') ? 'accepted' : 'rejected';
        $stmt = $pdo->prepare('UPDATE transit_join_requests SET status = ? WHERE id = ?');
        $stmt->execute([$newStatus, $id]);

        // If accepted, add to memberships and award points
        if ($action === 'accept') {
            // Check if already a member
            $stmt = $pdo->prepare('SELECT id FROM transit_route_memberships WHERE user_id = ? AND route_id = ?');
            $stmt->execute([$userId, $routeId]);
            if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
                $stmt = $pdo->prepare('INSERT INTO transit_route_memberships (user_id, route_id, joined_at) VALUES (?, ?, NOW())');
                $stmt->execute([$userId, $routeId]);
            }

            // Count how many routes user already joined
            $stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM transit_route_memberships WHERE user_id = ?');
            $stmt->execute([$userId]);
            $count = $stmt->fetch(PDO::FETCH_ASSOC);
            $isFirstRoute = ($count['cnt'] === 1);

            // Award points for joining transit route
            awardUserPoints($pdo, $userId, 15, 0, false, 'Joining a shuttle route');
            if ($isFirstRoute) {
                awardUserPoints($pdo, $userId, 10, 0, false, 'First shuttle joined');
            }
        }

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Update transit request error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to update request']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
