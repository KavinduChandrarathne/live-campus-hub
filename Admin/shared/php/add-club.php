<?php
// Add a new club to clubs.json
$clubsFile = '../json/clubs.json';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : '';
    $desc = isset($_POST['desc']) ? trim($_POST['desc']) : '';

    if ($name === '' || $icon === '') {
        echo json_encode(['success' => false, 'error' => 'Name and icon are required']);
        exit;
    }

    // load existing clubs
    $clubs = [];
    if (file_exists($clubsFile)) {
        $json = file_get_contents($clubsFile);
        $clubs = json_decode($json, true);
        if (!is_array($clubs)) {
            $clubs = [];
        }
    }

    // prevent duplicates
    foreach ($clubs as $c) {
        if (isset($c['name']) && strcasecmp(trim($c['name']), $name) === 0) {
            echo json_encode(['success' => false, 'error' => 'Club already exists']);
            exit;
        }
    }

    $club = [
        'name' => $name,
        'icon' => $icon,
        'desc' => $desc
    ];

    array_push($clubs, $club);
    file_put_contents($clubsFile, json_encode($clubs, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
