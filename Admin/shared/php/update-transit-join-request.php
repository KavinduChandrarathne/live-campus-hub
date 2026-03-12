<?php
header('Content-Type: application/json');
$reqFile = '../json/transit-join-requests.json';
$userFile = '../json/users.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $action = isset($_POST['action']) ? trim($_POST['action']) : '';

    if ($id === '' || !in_array($action, ['accept', 'reject'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        exit;
    }

    $requests = [];
    if (file_exists($reqFile)) {
        $json = file_get_contents($reqFile);
        $requests = json_decode($json, true);
        if (!is_array($requests)) {
            $requests = [];
        }
    }

    $updated = false;
    foreach ($requests as &$r) {
        if (isset($r['id']) && $r['id'] === $id && $r['status'] === 'pending') {
            $r['status'] = $action === 'accept' ? 'accepted' : 'rejected';
            $updated = true;
            if ($action === 'accept') {
                // add route to user's joinedRoutes
                $users = [];
                if (file_exists($userFile)) {
                    $uj = json_decode(file_get_contents($userFile), true);
                    if (is_array($uj)) {
                        $users = $uj;
                    }
                }
                foreach ($users as &$u) {
                    if (isset($u['username']) && $u['username'] === $r['username']) {
                        if (!isset($u['joinedRoutes']) || !is_array($u['joinedRoutes'])) {
                            $u['joinedRoutes'] = [];
                        }
                        if (!in_array($r['route'], $u['joinedRoutes'])) {
                            $u['joinedRoutes'][] = $r['route'];
                        }
                    }
                }
                file_put_contents($userFile, json_encode($users, JSON_PRETTY_PRINT));
            }
            break;
        }
    }

    if ($updated) {
        file_put_contents($reqFile, json_encode($requests, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Request not found or already handled']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
