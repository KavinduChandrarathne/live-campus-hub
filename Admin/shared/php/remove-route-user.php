<?php
header('Content-Type: application/json');
$userFile = '../json/users.json';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$route = isset($_POST['route']) ? trim($_POST['route']) : '';
$user = isset($_POST['username']) ? trim($_POST['username']) : '';

if ($route === '' || $user === '') {
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit;
}

$changed = false;
$users = [];
if (file_exists($userFile)) {
    $json = file_get_contents($userFile);
    $users = json_decode($json, true);
    if (!is_array($users)) {
        $users = [];
    }
}

foreach ($users as &$u) {
    if ((isset($u['username']) && strtolower($u['username']) === strtolower($user)) ||
        (isset($u['email']) && strtolower($u['email']) === strtolower($user))) {
        if (isset($u['joinedRoutes']) && is_array($u['joinedRoutes'])) {
            $idx = array_search($route, $u['joinedRoutes']);
            if ($idx !== false) {
                array_splice($u['joinedRoutes'], $idx, 1);
                $changed = true;
            }
        }
        break;
    }
}

if ($changed) {
    file_put_contents($userFile, json_encode($users, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'User not found or not joined']);
}
