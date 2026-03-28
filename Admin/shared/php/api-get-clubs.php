<?php
// Get all clubs from database
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->prepare('SELECT id, name, icon, description FROM clubs ORDER BY name ASC');
    $stmt->execute();
    $clubs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert description to desc for frontend compatibility
    $clubs = array_map(function($club) {
        return [
            'id' => $club['id'],
            'name' => $club['name'],
            'icon' => $club['icon'],
            'desc' => $club['description'] ?: ''
        ];
    }, $clubs);
    
    echo json_encode($clubs);
} catch (PDOException $e) {
    error_log('Get clubs error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch clubs']);
}
?>
