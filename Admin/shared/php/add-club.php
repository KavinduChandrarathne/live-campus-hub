<?php
// Add a new club to campus_hub database
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $icon = isset($_POST['icon']) ? trim($_POST['icon']) : '';
    $desc = isset($_POST['desc']) ? trim($_POST['desc']) : '';

    if ($name === '' || $icon === '') {
        echo json_encode(['success' => false, 'error' => 'Name and icon are required']);
        exit;
    }

    try {
        // Check for duplicate club name
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:name)');
        $stmt->execute([':name' => $name]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Club already exists']);
            exit;
        }

        // Insert new club
        $stmt = $pdo->prepare('
            INSERT INTO clubs (name, icon, description)
            VALUES (:name, :icon, :desc)
        ');
        $stmt->execute([
            ':name' => $name,
            ':icon' => $icon,
            ':desc' => $desc ?: null
        ]);

        $clubId = $pdo->lastInsertId();
        
        // Return the newly created club so it can be displayed immediately
        echo json_encode([
            'success' => true,
            'club' => [
                'id' => $clubId,
                'name' => $name,
                'icon' => $icon,
                'desc' => $desc ?: ''
            ]
        ]);
        exit;
    } catch (PDOException $e) {
        error_log('Club creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create club']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
