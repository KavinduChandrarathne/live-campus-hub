<?php
// Add a new transit route join request via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';

    if ($route === '' || $username === '') {
        echo json_encode(['success' => false, 'error' => 'Route and username are required']);
        exit;
    }

    try {
        // Find user by username or email
        $usernameLower = strtolower($username);
        $stmt = $pdo->prepare('
            SELECT id FROM users 
            WHERE LOWER(username) = ? OR LOWER(email) = ?
        ');
        $stmt->execute([$usernameLower, $usernameLower]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'User not found']);
            exit;
        }

        $userId = $user['id'];

        // Find route
        $routeLower = strtolower($route);
        $stmt = $pdo->prepare('SELECT id FROM transit_routes WHERE LOWER(name) = ?');
        $stmt->execute([$routeLower]);
        $routeRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$routeRow) {
            // Create route if it doesn't exist
            $stmt = $pdo->prepare('INSERT INTO transit_routes (name) VALUES (?)');
            $stmt->execute([$route]);
            $routeId = $pdo->lastInsertId();
        } else {
            $routeId = $routeRow['id'];
        }

        // Check if user is already a member of this route
        $stmt = $pdo->prepare('SELECT id FROM transit_route_memberships WHERE user_id = ? AND route_id = ?');
        $stmt->execute([$userId, $routeId]);
        $membership = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($membership) {
            echo json_encode(['success' => false, 'error' => 'Already joined this route']);
            exit;
        }

        // Check latest join request for this user/route
        $stmt = $pdo->prepare('
            SELECT id, status FROM transit_join_requests 
            WHERE user_id = ? AND route_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ');
        $stmt->execute([$userId, $routeId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $status = strtolower(trim($existing['status'] ?? ''));

            // Legacy blank status is treated as inactive/rejected, and normalized for future checks.
            if ($status === '') {
                $status = 'rejected';
                $stmt = $pdo->prepare('UPDATE transit_join_requests SET status = ? WHERE id = ?');
                $stmt->execute(['rejected', $existing['id']]);
            }

            if ($status === 'pending') {
                echo json_encode(['success' => false, 'error' => 'Already requested to join this route']);
                exit;
            }

            if ($status === 'accepted') {
                // If user was accepted but is now removed from memberships, allow re-request.
                $stmt = $pdo->prepare('SELECT id FROM transit_route_memberships WHERE user_id = ? AND route_id = ?');
                $stmt->execute([$userId, $routeId]);
                $stillMember = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($stillMember) {
                    echo json_encode(['success' => false, 'error' => 'Already joined this route']);
                    exit;
                }
                // allow a new request if accepted but membership is removed
            }

            // rejected -> allowed
        }


        // Create join request
        $stmt = $pdo->prepare('
            INSERT INTO transit_join_requests (user_id, route_id, status, created_at)
            VALUES (?, ?, ?, NOW())
        ');
        $stmt->execute([$userId, $routeId, 'pending']);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('Transit join request creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create request']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
