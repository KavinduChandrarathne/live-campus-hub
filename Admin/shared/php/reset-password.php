<?php
// reset-password.php: Reset user password with current password verification
header('Content-Type: application/json');
$usersFile = '../json/users.json';
$adminsFile = '../json/admins.json';

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

$file = ($role === 'admin') ? $adminsFile : $usersFile;
$data = [];
if (file_exists($file)) {
    $json = file_get_contents($file);
    $data = json_decode($json, true);
    if (!is_array($data)) $data = [];
}

$updated = false;
foreach ($data as &$u) {
    if (strcasecmp($u['email'], $email) === 0) {
        if ($u['password'] !== $currentPassword) {
            echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
            exit;
        }
        $u['password'] = $newPassword;
        $updated = true;
        break;
    }
}
if ($updated) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'User not found']);
}
