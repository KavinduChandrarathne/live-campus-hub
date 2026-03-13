<?php
header('Content-Type: application/json');
$requestsFile = '../json/club-join-requests.json';
$usersFile = '../json/users.json';

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

    $oldStatus = $requests[$index]['status'];
    $requests[$index]['status'] = $status;

    // Update user's joinedClubs
    $studentId = strtoupper(trim($requests[$index]['studentId']));
    $clubName = trim($requests[$index]['clubName']);

    $users = [];
    if (file_exists($usersFile)) {
        $uj = file_get_contents($usersFile);
        $users = json_decode($uj, true);
        if (!is_array($users)) {
            $users = [];
        }
    }

    foreach ($users as &$u) {
        if (isset($u['studentId']) && strtoupper(trim($u['studentId'])) === $studentId) {
            if (!isset($u['joinedClubs']) || !is_array($u['joinedClubs'])) {
                $u['joinedClubs'] = [];
            }
            $clubIndex = array_search($clubName, $u['joinedClubs']);
            if ($status === 'accepted' && $oldStatus !== 'accepted') {
                if ($clubIndex === false) {
                    $u['joinedClubs'][] = $clubName;
                }
            } elseif ($status !== 'accepted' && $oldStatus === 'accepted') {
                if ($clubIndex !== false) {
                    array_splice($u['joinedClubs'], $clubIndex, 1);
                }
            }
            break;
        }
    }

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true]);
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
