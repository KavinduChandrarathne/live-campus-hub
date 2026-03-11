<?php
header('Content-Type: application/json');
$requestsFile = '../json/club-join-requests.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $index = isset($_POST['index']) ? intval($_POST['index']) : null;
    $status = isset($_POST['status']) ? trim($_POST['status']) : '';

    if ($index === null || $status === '') {
        echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        exit;
    }

    if (!file_exists($requestsFile)) {
        echo json_encode(['success' => false, 'error' => 'Requests file not found']);
        exit;
    }

    $json = file_get_contents($requestsFile);
    $requests = json_decode($json, true);
    if (!is_array($requests)) {
        $requests = [];
    }

    if (!isset($requests[$index])) {
        echo json_encode(['success' => false, 'error' => 'Invalid index']);
        exit;
    }

    $requests[$index]['status'] = $status;

    file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true]);
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
