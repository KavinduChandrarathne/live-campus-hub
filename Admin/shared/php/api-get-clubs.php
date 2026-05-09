<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once 'db.php';

try {
    // Try to get clubs from database
    $query = 'SELECT id, name, icon, description FROM clubs ORDER BY name ASC';
    $result = $pdo->query($query);
    $clubs = $result->fetchAll(PDO::FETCH_ASSOC);
    
    $output = [];
    foreach ($clubs as $club) {
        $output[] = [
            'id' => $club['id'] ?? null,
            'name' => $club['name'] ?? '',
            'icon' => $club['icon'] ?? 'fa-users',
            'desc' => $club['description'] ?? ''
        ];
    }

    echo json_encode($output);
    exit;
    
} catch (Throwable $e) {
    error_log('Clubs API Error: ' . $e->getMessage());
    echo json_encode([]);
}
?>
