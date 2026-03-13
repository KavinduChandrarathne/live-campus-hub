<?php
header('Content-Type: application/json');
$reqFile = '../json/transit-join-requests.json';
$username = isset($_GET['username']) ? trim($_GET['username']) : '';

if ($username === '') {
    echo json_encode([]);
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

$result = [];
foreach ($requests as $r) {
    if (isset($r['username']) && strtolower($r['username']) === strtolower($username) && isset($r['status']) && $r['status'] === 'pending') {
        $result[] = $r;
    }
}

echo json_encode($result);
