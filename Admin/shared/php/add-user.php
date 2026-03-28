<?php
// Add a new user to campus_hub database
header('Content-Type: application/json');
require_once 'db.php';

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

    try {
        // Check for duplicate email
        $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Email already exists']);
            exit;
        }

        // Check for duplicate studentId
        $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(studentId) = LOWER(:studentId) LIMIT 1');
        $stmt->execute([':studentId' => $studentId]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Student ID already exists']);
            exit;
        } 

        // Insert new user
        $username = strtolower($firstName . $lastName);
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('
            INSERT INTO users (username, email, password, role, firstName, lastName, studentId, faculty, dob, picture)
            VALUES (:username, :email, :password, "student", :firstName, :lastName, :studentId, :faculty, :dob, "./images/default.png")
        ');
        $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':firstName' => $firstName,
            ':lastName' => $lastName,
            ':studentId' => $studentId,
            ':faculty' => $faculty,
            ':dob' => $dob
        ]);

        // Create user_rewards record
        $userId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('
            INSERT INTO user_rewards (user_id, points, badges, tier)
            VALUES (:userId, 0, 0, "BRONZE")
        ');
        $stmt->execute([':userId' => $userId]);

        echo json_encode(['success' => true]);
        exit;
    } catch (PDOException $e) {
        error_log('User creation error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to create user']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
