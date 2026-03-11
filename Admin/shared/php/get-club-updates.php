<?php
header('Content-Type: application/json');
$updatesFile = '../json/club-updates.json';
$club = isset($_GET['club']) ? trim($_GET['club']) : '';

if ($club === '') {
    echo json_encode([]);
    exit;
}

$clubKey = strtolower($club);

$updates = [];
if (file_exists($updatesFile)) {
    $json = file_get_contents($updatesFile);
    $updates = json_decode($json, true);
    if (!is_array($updates)) {
        $updates = [];
    }
}

// filter updates for this club
$result = [];
foreach ($updates as $u) {
    if (isset($u['clubName']) && strtolower(trim($u['clubName'])) === $clubKey) {
        $result[] = $u;
    }
}

echo json_encode($result);
