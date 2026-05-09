<?php
// API endpoint for student/user login via MySQL
header('Content-Type: application/json');
require_once 'db.php';
require_once __DIR__ . '/../../../api/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'error' => 'Missing email or password']);
    exit;
}

try {
    // Look up user by email or username
    $stmt = $pdo->prepare('
        SELECT id, email, username, password, firstName, lastName, faculty, studentId, picture, role
        FROM users
        WHERE LOWER(email) = LOWER(:email) OR LOWER(username) = LOWER(:username)
        LIMIT 1
    ');
    $stmt->execute([':email' => $email, ':username' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'No account found with that email/username']);
        exit;
    }

    // Verify password using password_verify for hashed passwords or raw password fallback
    if (!password_verify($password, $user['password']) && $password !== $user['password']) {
        echo json_encode(['success' => false, 'error' => 'Incorrect password']);
        exit;
    }

    // Get full user data with rewards and memberships
    $fullUser = getUserWithMemberships($pdo, $user['id']);
    if ($fullUser && isset($fullUser['password'])) {
        unset($fullUser['password']);
    }

    $tokenPayload = [
        'sub' => $fullUser['id'],
        'role' => $fullUser['role'],
        'email' => $fullUser['email'],
        'studentId' => $fullUser['studentId'] ?? ''
    ];
    $token = generateJwt($tokenPayload, 86400 * 7);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => $fullUser
    ]);
    exit;

} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error. Please try again later']);
    exit;
}
