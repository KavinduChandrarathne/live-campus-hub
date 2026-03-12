<?php
header('Content-Type: application/json');
$userFile = '../json/users.json';
$route = isset($_GET['route']) ? trim($_GET['route']) : '';

if ($route === '') {
    echo json_encode([]);
    exit;
}

$users = [];
if (file_exists($userFile)) {
    $json = file_get_contents($userFile);
    $users = json_decode($json, true);
    if (!is_array($users)) {
        $users = [];
    }
}

$result = [];
foreach ($users as $u) {
    if (isset($u['joinedRoutes']) && is_array($u['joinedRoutes']) && in_array($route, $u['joinedRoutes'])) {
        $result[] = [
            'username' => $u['username'] ?? $u['email'] ?? '',
            'firstName' => $u['firstName'] ?? '',
            'lastName' => $u['lastName'] ?? '',
            'email' => $u['email'] ?? '',
            'faculty' => $u['faculty'] ?? '',
            'picture' => $u['picture'] ?? ''
        ];
    }
}

echo json_encode($result);
