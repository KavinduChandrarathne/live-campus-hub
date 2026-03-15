<?php
// Handle profile photo upload and update users.json
header('Content-Type: application/json');
$usersFile = '../json/users.json';
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

    // Update users.json
    $users = [];
    if (file_exists($usersFile)) {
        $json = file_get_contents($usersFile);
        $users = json_decode($json, true);
        if (!is_array($users)) $users = [];
    }
    $updated = false;
    foreach ($users as &$u) {
        if (strcasecmp($u['email'], $email) === 0) {
            $u['picture'] = $relativePath;
            $updated = true;
            break;
        }
    }
    if ($updated) {
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'picture' => $relativePath]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
