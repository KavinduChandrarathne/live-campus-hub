<?php
// Database connection test endpoint
header('Content-Type: application/json');

try {
    require_once 'db.php';
    
    // Test connection by running a simple query
    $stmt = $pdo->query('SELECT VERSION() as version');
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'database' => 'campus_hub',
        'mysql_version' => $result['version'] ?? 'unknown'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
