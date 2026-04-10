<?php
header('Content-Type: application/json');

// Get the JSON data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing alert ID']);
    exit;
}

$alertId = htmlspecialchars($input['id']);

// Path to JSON file
$alertsFile = __DIR__ . '/../json/emergency-alerts.json';

// Read existing alerts
$alerts = [];
if (file_exists($alertsFile)) {
    $content = file_get_contents($alertsFile);
    if ($content) {
        $alerts = json_decode($content, true) ?? [];
    }
}

// Find and update the alert status
$alertFound = false;
foreach ($alerts as &$alert) {
    if ($alert['id'] === $alertId) {
        $alert['status'] = 'resolved';
        $alert['resolvedAt'] = date('c');
        $alertFound = true;
        break;
    }
}

if ($alertFound) {
    // Write back to file
    if (file_put_contents($alertsFile, json_encode($alerts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
        echo json_encode(['success' => true, 'message' => 'Alert marked as resolved']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to resolve alert']);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Alert not found']);
}
?>
