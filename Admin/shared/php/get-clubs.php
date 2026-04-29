<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query('SELECT id, name, icon FROM clubs ORDER BY name ASC');
        $clubs = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'clubs' => $clubs
        ]);
        exit;
    } catch (PDOException $e) {
        error_log('Get clubs error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to fetch clubs']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request.']);
    exit;
}