<?php
// reset-password.php: Reset user password via MySQL
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$email = $_POST['email'] ?? '';
$currentPassword = $_POST['currentPassword'] ?? '';
$newPassword = $_POST['newPassword'] ?? '';
$role = $_POST['role'] ?? 'student';

if (!$email || !$currentPassword || !$newPassword) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    if ($role === 'admin') {
        $stmt = $pdo->prepare('SELECT password FROM admins WHERE LOWER(email) = LOWER(:email)');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || $user['password'] !== $currentPassword) {
            echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE admins SET password = :newPassword WHERE LOWER(email) = LOWER(:email)');
        $stmt->execute([':newPassword' => $newPassword, ':email' => $email]);
    } else {
        $stmt = $pdo->prepare('SELECT password FROM users WHERE LOWER(email) = LOWER(:email)');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || $user['password'] !== $currentPassword) {
            echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE users SET password = :newPassword WHERE LOWER(email) = LOWER(:email)');
        $stmt->execute([':newPassword' => $newPassword, ':email' => $email]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('Reset password error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to reset password']);
}
