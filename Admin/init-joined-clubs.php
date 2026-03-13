<?php
// Initialize joinedClubs for existing users based on accepted club join requests

$usersFile = 'shared/json/users.json';
$requestsFile = 'shared/json/club-join-requests.json';

if (!file_exists($usersFile) || !file_exists($requestsFile)) {
    echo "Files not found\n";
    exit;
}

$users = json_decode(file_get_contents($usersFile), true);
$requests = json_decode(file_get_contents($requestsFile), true);

if (!is_array($users) || !is_array($requests)) {
    echo "Invalid JSON\n";
    exit;
}

$userClubs = [];
foreach ($requests as $r) {
    if (isset($r['studentId']) && isset($r['clubName']) && isset($r['status']) && $r['status'] === 'accepted') {
        $sid = strtoupper(trim($r['studentId']));
        $club = trim($r['clubName']);
        if (!isset($userClubs[$sid])) {
            $userClubs[$sid] = [];
        }
        if (!in_array($club, $userClubs[$sid])) {
            $userClubs[$sid][] = $club;
        }
    }
}

foreach ($users as &$u) {
    if (isset($u['studentId'])) {
        $sid = strtoupper(trim($u['studentId']));
        if (isset($userClubs[$sid])) {
            $u['joinedClubs'] = $userClubs[$sid];
        } else {
            $u['joinedClubs'] = [];
        }
    }
}

file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

echo "Updated users.json with joinedClubs\n";
?>