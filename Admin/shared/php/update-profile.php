<?php
// update-profile.php: Update user profile info (name, dob, etc.) via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$email = $_POST['email'] ?? '';
$role = $_POST['role'] ?? 'student';
$fields = ['firstName', 'lastName', 'dob', 'studentId', 'faculty'];

if (!$email) {
    echo json_encode(['success' => false, 'error' => 'Missing email']);
    exit;
}

try {
    if ($role === 'admin') {
        $table = 'admins';
    } else {
        $table = 'users';
    }

    $updates = [];
    $params = [':email' => $email];

    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            $updates[] = "{$field} = :{$field}";
            $params[":{$field}"] = $_POST[$field];
        }
    }

    if (empty($updates)) {
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit;
    }

    $updateClause = implode(', ', $updates);
    $sql = "UPDATE {$table} SET {$updateClause} WHERE LOWER(email) = LOWER(:email)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
} catch (PDOException $e) {
    error_log('Update profile error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
}
