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
    
    if (is_array($clubs) && count($clubs) > 0) {
        // Format database clubs
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
    }
    
    // Fallback to JSON if no database clubs
    $jsonFile = __DIR__ . '/../json/clubs.json';
    if (file_exists($jsonFile)) {
        echo file_get_contents($jsonFile);
        exit;
    }
    
    echo json_encode([]);
    
} catch (Throwable $e) {
    error_log('Clubs API Error: ' . $e->getMessage());
    // Return JSON file as fallback
    $jsonFile = __DIR__ . '/../json/clubs.json';
    if (file_exists($jsonFile)) {
        echo file_get_contents($jsonFile);
    } else {
        echo json_encode([]);
    }
}
?>
