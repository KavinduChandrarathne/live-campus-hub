<?php
// update-user.php - Handle user update requests via MySQL

header('Content-Type: application/json');
require_once 'db.php';

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

    // Validate field
    $allowed_fields = ['firstName', 'lastName', 'faculty', 'dob'];
    if (!in_array($field, $allowed_fields)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid field'
        ]);
        exit;
    }

    try {
        // Update user field
        $stmt = $pdo->prepare("
            UPDATE users 
            SET {$field} = :value
            WHERE LOWER(studentId) = LOWER(:studentId)
        ");
        $stmt->execute([
            ':value' => $value,
            ':studentId' => $studentId
        ]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
    } catch (PDOException $e) {
        error_log('Update user error: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error updating user'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid action'
    ]);
}
?>
