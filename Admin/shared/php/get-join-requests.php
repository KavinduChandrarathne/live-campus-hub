<?php
header('Content-Type: application/json');
$requestsFile = '../json/club-join-requests.json';

$requests = [];
if (file_exists($requestsFile)) {
    $json = file_get_contents($requestsFile);
    $requests = json_decode($json, true);
    if (!is_array($requests)) {
        $requests = [];
    }
}

// load user map so we can correct any name/picture mismatches
$usersFile = '../json/users.json';
$userMap = [];
if (file_exists($usersFile)) {
    $ujson = file_get_contents($usersFile);
    $allUsers = json_decode($ujson, true);
    if (is_array($allUsers)) {
        foreach ($allUsers as $u) {
            if (isset($u['studentId'])) {
                $sid = strtoupper(trim($u['studentId']));
                $userMap[$sid] = [
                    'name' => trim(($u['firstName'] ?? '') . ' ' . ($u['lastName'] ?? '')),
                    'picture' => $u['picture'] ?? ''
                ];
            }
        }
    }
}

$changed = false;
foreach ($requests as &$r) {
    if (isset($r['studentId'])) {
        $sid = strtoupper(trim($r['studentId']));
        if (isset($userMap[$sid])) {
            $correctName = $userMap[$sid]['name'];
            $correctPic = $userMap[$sid]['picture'];
            if (($r['name'] ?? '') !== $correctName || ($r['picture'] ?? '') !== $correctPic) {
                $r['name'] = $correctName;
                $r['picture'] = $correctPic;
                $changed = true;
            }
        }
    }
}

if ($changed) {
    // write back fixes so file stays consistent
    file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT));
}

echo json_encode($requests);
?>