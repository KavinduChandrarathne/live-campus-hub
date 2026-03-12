<?php
// Add a new join request to JSON
date_default_timezone_set('Asia/Colombo');
$reqFile = '../json/transit-join-requests.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $route = isset($_POST['route']) ? trim($_POST['route']) : '';
    $user = isset($_POST['username']) ? trim($_POST['username']) : '';

    if ($route === '' || $user === '') {
        echo json_encode(['success' => false, 'error' => 'Route and username are required']);
        exit;
    }

    $request = [
        'id' => uniqid('req_'),
        'route' => $route,
        'username' => $user,
        'datetime' => date('Y-m-d H:i:s'),
        'status' => 'pending'
    ];

    $arr = [];
    if (file_exists($reqFile)) {
        $json = file_get_contents($reqFile);
        $arr = json_decode($json, true);
        if (!is_array($arr)) {
            $arr = [];
        }
    }

    array_unshift($arr, $request);
    file_put_contents($reqFile, json_encode($arr, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
