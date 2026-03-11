<?php
// update-user.php - Handle user update requests

header('Content-Type: application/json');

// Get POST data
$action = $_POST['action'] ?? null;

if ($action === 'update-user') {
    $studentId = $_POST['studentId'] ?? null;
    $field = $_POST['field'] ?? null;
    $value = $_POST['value'] ?? null;

    // Validate inputs
    if (!$studentId || !$field) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        exit;
    }

    // Load users JSON file
    $usersFile = __DIR__ . '/../json/users.json';
    
    if (!file_exists($usersFile)) {
        echo json_encode([
            'success' => false,
            'message' => 'Users file not found'
        ]);
        exit;
    }

    // Read the file
    $usersJson = file_get_contents($usersFile);
    $users = json_decode($usersJson, true);

    if ($users === null) {
        echo json_encode([
            'success' => false,
            'message' => 'Error decoding users JSON'
        ]);
        exit;
    }

    // Find and update the user
    $userFound = false;
    foreach ($users as &$user) {
        if ($user['studentId'] === $studentId) {
            // Map field names to user object properties
            switch($field) {
                case 'firstName':
                    $user['firstName'] = $value;
                    break;
                case 'lastName':
                    $user['lastName'] = $value;
                    break;
                case 'faculty':
                    $user['faculty'] = $value;
                    break;
                case 'dob':
                    $user['dob'] = $value;
                    break;
                default:
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid field'
                    ]);
                    exit;
            }
            $userFound = true;
            break;
        }
    }

    if (!$userFound) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    // Write the updated data back to the file
    $updatedJson = json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    if (file_put_contents($usersFile, $updatedJson) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error writing to file'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid action'
    ]);
}
?>
