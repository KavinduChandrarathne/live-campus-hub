<?php
header('Content-Type: application/json');
$updatesFile = '../json/transit-updates.json';
$route = isset($_GET['route']) ? trim($_GET['route']) : '';

if ($route === '') {
    echo json_encode([]);
    exit;
}

$routeKey = strtolower($route);

$updates = [];
if (file_exists($updatesFile)) {
    $json = file_get_contents($updatesFile);
    $updates = json_decode($json, true);
    if (!is_array($updates)) {
        $updates = [];
    }
}

// filter updates for this route
$result = [];
foreach ($updates as $u) {
    if (isset($u['route']) && strtolower(trim($u['route'])) === $routeKey) {
        $result[] = $u;
    }
}

echo json_encode($result);
