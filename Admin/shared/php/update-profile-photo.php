<?php
// Handle profile photo upload and update users table via MySQL
header('Content-Type: application/json');
require_once 'db.php';

$imagesDir = '../../../images/';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['profilePhoto'])) {
    $email = $_POST['email'] ?? '';
    if (!$email) {
        echo json_encode(['success' => false, 'error' => 'Missing email']);
        exit;
    }

    $file = $_FILES['profilePhoto'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'error' => 'Invalid file type']);
        exit;
    }

    $newName = 'profile_' . md5($email . time()) . '.' . $ext;
    $targetPath = $imagesDir . $newName;
    $relativePath = './images/' . $newName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode(['success' => false, 'error' => 'Failed to upload image']);
        exit;
    }

    try {
        // Update user's profile photo in database
        $stmt = $pdo->prepare('UPDATE users SET picture = :photo WHERE email = :email');
        $stmt->execute([':photo' => $relativePath, ':email' => $email]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'picture' => $relativePath]);
        } else {
            echo json_encode(['success' => false, 'error' => 'User not found']);
        }
        exit;
    } catch (PDOException $e) {
        error_log('Update profile photo error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
