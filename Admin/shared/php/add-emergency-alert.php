<?php
header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/../php/db.php';

// Get the JSON data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['title']) || !isset($input['type']) || !isset($input['location']) || !isset($input['severity'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // Prepare the INSERT statement
    $stmt = $pdo->prepare("
        INSERT INTO emergency_alerts
        (title, type, location, description, severity, instructions, active_until, created_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'active')
    ");

    // Execute the statement
    $result = $stmt->execute([
        htmlspecialchars($input['title']),
        htmlspecialchars($input['type']),
        htmlspecialchars($input['location']),
        htmlspecialchars($input['description'] ?? ''),
        htmlspecialchars($input['severity']),
        htmlspecialchars($input['instructions'] ?? ''),
        $input['activeUntil']
    ]);

    if ($result) {
        // Get the inserted alert ID
        $alertId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Emergency alert created successfully',
            'alertId' => $alertId
        ]);
    } else {
        throw new Exception('Failed to insert alert');
    }

} catch (Exception $e) {
    error_log('Emergency alert creation error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create emergency alert']);
}
?>

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
