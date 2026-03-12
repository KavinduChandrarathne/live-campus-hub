<?php
header('Content-Type: application/json');
$reqFile = '../json/transit-join-requests.json';
$userFile = '../json/users.json';

function findUser($username) {
    global $userFile;
    if (!file_exists($userFile)) return null;
    $json = file_get_contents($userFile);
    $users = json_decode($json, true);
    if (!is_array($users)) return null;
    foreach ($users as $u) {
        if ((isset($u['username']) && strtolower($u['username']) === strtolower($username)) ||
            (isset($u['email']) && strtolower($u['email']) === strtolower($username))) {
            return $u;
        }
    }
    return null;
}

$requests = [];
if (file_exists($reqFile)) {
    $json = file_get_contents($reqFile);
    $requests = json_decode($json, true);
    if (!is_array($requests)) {
        $requests = [];
    }
}

// enhance each request with user details if available
foreach ($requests as &$r) {
    if (isset($r['username'])) {
        $u = findUser($r['username']);
        if ($u) {
            $r['email'] = $u['email'] ?? '';
            $r['firstName'] = $u['firstName'] ?? '';
            $r['lastName'] = $u['lastName'] ?? '';
            $r['faculty'] = $u['faculty'] ?? '';
            $r['picture'] = $u['picture'] ?? '';
        }
    }
}

echo json_encode($requests);
