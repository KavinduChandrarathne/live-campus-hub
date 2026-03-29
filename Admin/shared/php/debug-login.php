<?php
// Debug endpoint to test login and show actual error
header('Content-Type: application/json');

$email = isset($_GET['email']) ? trim($_GET['email']) : 'nicholeperea0@gmail.com';
$password = isset($_GET['password']) ? $_GET['password'] : 'password';

$response = [
    'test_email' => $email,
    'steps' => []
];

try {
    // Step 1: Test basic connection
    $response['steps'][] = 'Attempting database connection...';
    require_once 'db.php';
    $response['steps'][] = '✓ Database connection successful';

    // Step 2: Test user lookup
    $response['steps'][] = 'Looking up user by email: ' . $email;
    $stmt = $pdo->prepare('
        SELECT id, email, username, password, firstName, lastName
        FROM users
        WHERE LOWER(email) = LOWER(:email) OR LOWER(username) = LOWER(:username)
        LIMIT 1
    ');
    $stmt->execute([':email' => $email, ':username' => $email]);
    $user = $stmt->fetch();
    
    if ($user) {
        $response['steps'][] = '✓ User found: ' . $user['email'];
        $response['user_found'] = true;
        $response['user_id'] = $user['id'];
        $response['user_email'] = $user['email'];
        
        // Step 3: Check password
        $response['steps'][] = 'Verifying password...';
        $passwordHash = $user['password'];
        $response['password_hash_stored'] = substr($passwordHash, 0, 20) . '...';
        
        if (password_verify($password, $passwordHash)) {
            $response['steps'][] = '✓ Password verified';
            $response['password_verified'] = true;
        } else {
            $response['steps'][] = '✗ Password mismatch';
            $response['password_verified'] = false;
        }
    } else {
        $response['steps'][] = '✗ User not found in database';
        $response['user_found'] = false;
        
        // Show what users exist
        $response['steps'][] = 'Checking available users in database...';
        $stmt = $pdo->query('SELECT id, email, username FROM users LIMIT 10');
        $users = $stmt->fetchAll();
        $response['available_users'] = $users;
    }
    
} catch (PDOException $e) {
    $response['error'] = 'PDO Error: ' . $e->getMessage();
    $response['error_code'] = $e->getCode();
    $response['steps'][] = '✗ Database error: ' . $e->getMessage();
} catch (Exception $e) {
    $response['error'] = 'General Error: ' . $e->getMessage();
    $response['steps'][] = '✗ Error: ' . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
