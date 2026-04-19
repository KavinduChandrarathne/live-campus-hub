<?php
header('Content-Type: application/json');

// Get the JSON data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['title']) || !isset($input['type']) || !isset($input['location']) || !isset($input['severity'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Generate unique ID
$alertId = uniqid('alert_', true);

// Create alert object
$alert = [
    'id' => $alertId,
    'title' => htmlspecialchars($input['title']),
    'type' => htmlspecialchars($input['type']),
    'location' => htmlspecialchars($input['location']),
    'description' => htmlspecialchars($input['description']),
    'severity' => htmlspecialchars($input['severity']),
    'instructions' => htmlspecialchars($input['instructions']),
    'activeUntil' => $input['activeUntil'],
    'createdAt' => $input['createdAt'],
    'status' => 'active'
];

// Path to JSON file
$alertsFile = __DIR__ . '/../json/emergency-alerts.json';

// Create directory if it doesn't exist
if (!is_dir(dirname($alertsFile))) {
    mkdir(dirname($alertsFile), 0755, true);
}

// Read existing alerts
$alerts = [];
if (file_exists($alertsFile)) {
    $content = file_get_contents($alertsFile);
    if ($content) {
        $alerts = json_decode($content, true) ?? [];
    }
}

// Add new alert
array_unshift($alerts, $alert);

// Keep only last 100 alerts
$alerts = array_slice($alerts, 0, 100);

// Write back to file
if (file_put_contents($alertsFile, json_encode($alerts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
    echo json_encode(['success' => true, 'message' => 'Alert published successfully', 'alert' => $alert]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save alert']);
}
?>
