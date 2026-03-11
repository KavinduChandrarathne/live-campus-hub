<?php
// Add a new club join request to JSON
header('Content-Type: application/json');
date_default_timezone_set('Asia/Colombo');
$requestsFile = '../json/club-join-requests.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $studentId = isset($_POST['studentId']) ? trim($_POST['studentId']) : '';
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if ($studentId === '' || $clubName === '') {
        echo json_encode(['success' => false, 'error' => 'Required fields missing']);
        exit;
    }

    // normalize ID for comparison
    $normalizedId = strtoupper($studentId);

    // look up user details on server side to avoid mismatched or tampered names
    $name = '';
    $picture = '';
    $usersFile = '../json/users.json';
    if (file_exists($usersFile)) {
        $usersJson = file_get_contents($usersFile);
        $allUsers = json_decode($usersJson, true);
        if (is_array($allUsers)) {
            foreach ($allUsers as $u) {
                if (isset($u['studentId']) && strtoupper(trim($u['studentId'])) === $normalizedId) {
                    // optionally restrict to students only
                    if (isset($u['role']) && $u['role'] !== 'student') {
                        echo json_encode(['success' => false, 'error' => 'Only student accounts may send club requests']);
                        exit;
                    }
                    $name = trim(($u['firstName'] ?? '') . ' ' . ($u['lastName'] ?? ''));
                    $picture = $u['picture'] ?? '';
                    break;
                }
            }
        }
    }

    if ($name === '') {
        // student id not recognized, reject
        echo json_encode(['success' => false, 'error' => 'Unknown student ID']);
        exit;
    }

    // build new request using server-sourced name/picture
    $request = [
        'name' => $name,
        'studentId' => $normalizedId,
        'clubName' => $clubName,
        'picture' => $picture,
        'message' => $message,
        'status' => 'pending',
        'datetime' => date('Y-m-d H:i:s')
    ];

    // load existing requests
    $requests = [];
    if (file_exists($requestsFile)) {
        $json = file_get_contents($requestsFile);
        $requests = json_decode($json, true);
        if (!is_array($requests)) {
            $requests = [];
        }
    }

    // prevent duplicates for same student and club
    foreach ($requests as $existing) {
        if (isset($existing['studentId'], $existing['clubName']) &&
            strcasecmp($existing['studentId'], $studentId) === 0 &&
            strcasecmp(trim($existing['clubName']), trim($clubName)) === 0) {
            echo json_encode(['success' => false, 'error' => 'Duplicate request']);
            exit;
        }
    }

    array_unshift($requests, $request);
    file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true]);
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
