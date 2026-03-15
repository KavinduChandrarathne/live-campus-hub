<?php
// update-profile.php: Update user profile info (name, dob, etc.)
header('Content-Type: application/json');
$usersFile = '../json/users.json';
$adminsFile = '../json/admins.json';

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
        foreach ($fields as $f) {
            if (isset($_POST[$f])) $u[$f] = $_POST[$f];
        }
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
