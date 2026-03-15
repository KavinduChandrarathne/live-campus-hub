<?php
// Add a new user to users.json
header('Content-Type: application/json');
date_default_timezone_set('Asia/Colombo');
$usersFile = '../json/users.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = trim($_POST['firstName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $faculty = trim($_POST['faculty'] ?? '');
    $studentId = trim($_POST['studentId'] ?? '');
    $dob = trim($_POST['dob'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!$firstName || !$lastName || !$faculty || !$studentId || !$dob || !$email || !$password) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    // Load existing users
    $users = [];
    if (file_exists($usersFile)) {
        $json = file_get_contents($usersFile);
        $users = json_decode($json, true);
        if (!is_array($users)) $users = [];
    }

    // Check for duplicate email or studentId
    foreach ($users as $u) {
        if (strcasecmp($u['email'], $email) === 0) {
            echo json_encode(['success' => false, 'error' => 'Email already exists']);
            exit;
        }
        if (strcasecmp($u['studentId'], $studentId) === 0) {
            echo json_encode(['success' => false, 'error' => 'Student ID already exists']);
            exit;
        }
    }

    $newUser = [
        'id' => count($users) + 1,
        'username' => strtolower($firstName . $lastName),
        'password' => $password,
        'email' => $email,
        'role' => 'student',
        'firstName' => $firstName,
        'lastName' => $lastName,
        'studentId' => $studentId,
        'faculty' => $faculty,
        'dob' => $dob,
        'picture' => './images/default.png',
        'joinedRoutes' => [],
        'rewards' => [
            'points' => 0,
            'badges' => 0,
            'tier' => 'BRONZE',
            'pointsToNext' => 50,
            'nextTier' => 'SILVER'
        ],
        'joinedClubs' => []
    ];

    $users[] = $newUser;

    // Save users
    $result = file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    if ($result === false) {
        echo json_encode(['success' => false, 'error' => 'Failed to save user. Check file permissions.']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
