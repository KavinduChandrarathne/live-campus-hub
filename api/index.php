<?php

require_once __DIR__ . '/../Admin/shared/php/env.php';
loadEnv();
require_once __DIR__ . '/../Admin/shared/php/db.php';
require_once __DIR__ . '/jwt.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJson(['success' => true, 'message' => 'OK'], 204);
}

$path = $_SERVER['PATH_INFO'] ?? null;
if ($path === null) {
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $scriptName = $_SERVER['SCRIPT_NAME'];
    $basePath = dirname($scriptName);
    $path = '/' . ltrim(substr($requestUri, strlen($basePath)), '/');
}

$path = trim($path, '/');
$segments = explode('/', $path);
$resource = $segments[0] ?? '';

switch ($resource) {
    case 'login':
        handleLogin();
        break;
    case 'users':
        handleUsers($segments);
        break;
    case 'clubs':
        handleClubs();
        break;
    case 'alerts':
        handleAlerts();
        break;
    case 'facility-updates':
        handleFacilityUpdates();
        break;
    case 'club-updates':
        handleClubUpdates();
        break;
    case 'transit-updates':
        handleTransitUpdates();
        break;
    case 'notifications':
        handleNotifications();
        break;
    case 'club-join-requests':
        handleClubJoinRequests();
        break;
    case 'transit-join-requests':
        handleTransitJoinRequests();
        break;
    default:
        sendJson(['success' => false, 'error' => 'Endpoint not found'], 404);
}

function getRequestPayload(): array {
    $payload = [];
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $body = file_get_contents('php://input');
        $payload = json_decode($body, true) ?: [];
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = $_POST;
    }
    return $payload;
}

function handleLogin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJson(['success' => false, 'error' => 'Invalid request method'], 405);
    }

    $data = getRequestPayload();
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        sendJson(['success' => false, 'error' => 'Missing email or password'], 400);
    }

    global $pdo;
    try {
        $user = findUserByIdentifier($pdo, $email);
        if (!$user) {
            sendJson(['success' => false, 'error' => 'No account found with that email or username'], 401);
        }

        if (!password_verify($password, $user['password']) && $password !== $user['password']) {
            sendJson(['success' => false, 'error' => 'Incorrect password'], 401);
        }

        $role = $user['role'] ?? 'student';
        if ($role === 'admin' && isset($user['id'])) {
            unset($user['password']);
            $tokenPayload = ['sub' => $user['id'], 'role' => 'admin', 'email' => $user['email'] ?? '', 'studentId' => $user['studentId'] ?? ''];
            $token = generateJwt($tokenPayload, 86400 * 7);
            sendJson(['success' => true, 'token' => $token, 'user' => $user]);
        }

        $fullUser = getUserWithMemberships($pdo, $user['id']);
        if (!$fullUser) {
            sendJson(['success' => false, 'error' => 'Could not load user profile'], 500);
        }

        unset($fullUser['password']);
        $tokenPayload = ['sub' => $fullUser['id'], 'role' => $fullUser['role'], 'email' => $fullUser['email'], 'studentId' => $fullUser['studentId'] ?? ''];
        $token = generateJwt($tokenPayload, 86400 * 7);
        sendJson(['success' => true, 'token' => $token, 'user' => $fullUser]);
    } catch (Exception $e) {
        error_log('API login error: ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'Login failed'], 500);
    }
}

function findUserByIdentifier(PDO $pdo, string $identifier): ?array {
    $identifierLower = strtolower($identifier);
    $stmt = $pdo->prepare('SELECT id, email, username, password, firstName, lastName, faculty, studentId, dob, picture, role FROM admins WHERE LOWER(email) = :identifier OR LOWER(studentId) = :identifier LIMIT 1');
    $stmt->execute([':identifier' => $identifierLower]);
    $admin = $stmt->fetch();
    if ($admin) {
        $admin['role'] = 'admin';
        return $admin;
    }

    $stmt = $pdo->prepare('SELECT id, username, email, password, firstName, lastName, faculty, studentId, dob, picture, role FROM users WHERE LOWER(email) = :identifier OR LOWER(username) = :identifier OR LOWER(studentId) = :identifier LIMIT 1');
    $stmt->execute([':identifier' => $identifierLower]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function handleUsers(array $segments): void {
    $auth = requireJwt();
    $method = $_SERVER['REQUEST_METHOD'];
    global $pdo;

    if (isset($segments[1]) && $segments[1] === 'current') {
        $user = getUserFromToken($pdo, $auth);
        if (!$user) {
            sendJson(['success' => false, 'error' => 'User not found'], 404);
        }
        sendJson(['success' => true, 'data' => $user]);
    }

    if ($method !== 'GET') {
        sendJson(['success' => false, 'error' => 'Invalid request method'], 405);
    }

    $studentId = trim($_GET['studentId'] ?? '');
    $email = trim($_GET['email'] ?? '');
    $search = trim($_GET['search'] ?? '');

    if ($studentId || $email) {
        $stmt = $pdo->prepare('SELECT id, username, email, firstName, lastName, faculty, studentId, dob, picture, role FROM users WHERE LOWER(studentId) = LOWER(:studentId) OR LOWER(email) = LOWER(:email) LIMIT 1');
        $stmt->execute([':studentId' => $studentId, ':email' => $email]);
        $user = $stmt->fetch();
        if (!$user) {
            sendJson(['success' => false, 'error' => 'User not found'], 404);
        }
        $user = getUserWithMemberships($pdo, $user['id']);
        unset($user['password']);
        sendJson(['success' => true, 'data' => $user]);
    }

    if ($search !== '') {
        if ($auth['role'] !== 'admin') {
            sendJson(['success' => false, 'error' => 'Admin access required'], 403);
        }
        $stmt = $pdo->prepare('SELECT id, username, email, firstName, lastName, faculty, studentId, picture, role FROM users WHERE LOWER(studentId) LIKE LOWER(:search) OR LOWER(firstName) LIKE LOWER(:search) OR LOWER(lastName) LIKE LOWER(:search) OR LOWER(email) LIKE LOWER(:search) ORDER BY firstName ASC LIMIT 100');
        $stmt->execute([':search' => "%$search%"]);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendJson(['success' => true, 'data' => $users]);
    }

    if ($auth['role'] !== 'admin') {
        sendJson(['success' => false, 'error' => 'Admin access required'], 403);
    }

    $stmt = $pdo->query('SELECT id, username, email, firstName, lastName, faculty, studentId, picture, role FROM users ORDER BY firstName ASC');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $users]);
}

function getUserFromToken(PDO $pdo, array $auth): ?array {
    if (($auth['role'] ?? '') === 'admin') {
        $stmt = $pdo->prepare('SELECT id, email, username, firstName, lastName, studentId, dob, picture, role FROM admins WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $auth['sub']]);
        return $stmt->fetch();
    }
    $user = getUserWithMemberships($pdo, $auth['sub']);
    if (!$user) {
        return null;
    }
    unset($user['password']);
    return $user;
}

function handleClubs(): void {
    global $pdo;
    $stmt = $pdo->query('SELECT id, name, icon, description FROM clubs ORDER BY name ASC');
    $clubs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $clubs]);
}

function handleAlerts(): void {
    global $pdo;
    $stmt = $pdo->prepare('SELECT id, title, type, location, description, severity, instructions, active_until as activeUntil, created_at as createdAt, status FROM emergency_alerts WHERE status = "active" AND active_until > NOW() ORDER BY created_at DESC');
    $stmt->execute();
    $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $alerts]);
}

function handleFacilityUpdates(): void {
    global $pdo;
    $stmt = $pdo->query('SELECT icon, message, description, created_at as datetime FROM facility_event_updates ORDER BY created_at DESC');
    $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $updates]);
}

function handleClubUpdates(): void {
    $auth = requireJwt();
    global $pdo;
    $studentId = trim($_GET['studentId'] ?? '');
    $clubName = trim($_GET['clubName'] ?? '');

    if ($studentId) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(studentId) = LOWER(:studentId) LIMIT 1');
        $stmt->execute([':studentId' => $studentId]);
        $user = $stmt->fetch();
        if (!$user) {
            sendJson(['success' => false, 'error' => 'User not found'], 404);
        }
        if ($auth['role'] !== 'admin' && strtolower($auth['studentId'] ?? '') !== strtolower($studentId)) {
            sendJson(['success' => false, 'error' => 'Unauthorized'], 403);
        }
        $stmt = $pdo->prepare('SELECT c.name as clubName, cu.icon, cu.message, cu.description, cu.created_at as datetime FROM club_updates cu JOIN clubs c ON cu.club_id = c.id JOIN club_memberships cm ON cm.club_id = c.id WHERE cm.user_id = :userId ORDER BY cu.created_at DESC');
        $stmt->execute([':userId' => $user['id']]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendJson(['success' => true, 'data' => $data]);
    }

    if ($clubName) {
        $stmt = $pdo->prepare('SELECT id FROM clubs WHERE LOWER(name) = LOWER(:clubName) LIMIT 1');
        $stmt->execute([':clubName' => $clubName]);
        $club = $stmt->fetch();
        if (!$club) {
            sendJson(['success' => false, 'error' => 'Club not found'], 404);
        }
        $stmt = $pdo->prepare('SELECT cu.icon, cu.message, cu.description, cu.created_at as datetime FROM club_updates cu WHERE cu.club_id = :clubId ORDER BY cu.created_at DESC');
        $stmt->execute([':clubId' => $club['id']]);
        $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendJson(['success' => true, 'data' => $updates]);
    }

    if ($auth['role'] !== 'admin') {
        sendJson(['success' => false, 'error' => 'studentId or clubName required'], 400);
    }

    $stmt = $pdo->query('SELECT c.name as clubName, cu.icon, cu.message, cu.description, cu.created_at as datetime FROM club_updates cu JOIN clubs c ON cu.club_id = c.id ORDER BY cu.created_at DESC');
    $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $updates]);
}

function handleTransitUpdates(): void {
    global $pdo;
    $route = trim($_GET['route'] ?? '');
    if (!$route) {
        sendJson(['success' => false, 'error' => 'route parameter required'], 400);
    }
    $stmt = $pdo->prepare('SELECT id, name FROM transit_routes WHERE LOWER(name) = LOWER(:route) LIMIT 1');
    $stmt->execute([':route' => $route]);
    $routeRow = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$routeRow) {
        sendJson(['success' => false, 'error' => 'Route not found'], 404);
    }
    $stmt = $pdo->prepare('SELECT icon, message, description, live_link as liveLink, created_by_username as userName, created_at as datetime FROM transit_updates WHERE route_id = :routeId ORDER BY created_at DESC');
    $stmt->execute([':routeId' => $routeRow['id']]);
    $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $updates]);
}

function handleNotifications(): void {
    $auth = requireJwt();
    global $pdo;
    $user = getUserFromToken($pdo, $auth);
    if (!$user) {
        sendJson(['success' => false, 'error' => 'User not found'], 404);
    }

    $stmt = $pdo->query('SELECT id, type, title, message, club_id as clubId, created_at as datetime FROM notifications ORDER BY created_at DESC');
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $filtered = [];
    foreach ($notifications as $notif) {
        if ($notif['type'] === 'club' && $notif['clubId']) {
            if ($auth['role'] === 'admin') {
                $filtered[] = $notif;
                continue;
            }
            $stmt = $pdo->prepare('SELECT c.name FROM clubs c WHERE c.id = :id');
            $stmt->execute([':id' => $notif['clubId']]);
            $club = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($club) {
                $stmt = $pdo->prepare('SELECT 1 FROM club_memberships WHERE user_id = :userId AND club_id = :clubId');
                $stmt->execute([':userId' => $user['id'], ':clubId' => $notif['clubId']]);
                if ($stmt->fetchColumn()) {
                    $filtered[] = $notif;
                }
            }
            continue;
        }
        $filtered[] = $notif;
    }

    sendJson(['success' => true, 'data' => $filtered]);
}

function handleClubJoinRequests(): void {
    $auth = requireJwt();
    if (($auth['role'] ?? '') !== 'admin') {
        sendJson(['success' => false, 'error' => 'Admin access required'], 403);
    }
    global $pdo;
    $stmt = $pdo->query('SELECT u.firstName, u.lastName, u.studentId, u.picture, c.name AS clubName, cjr.message, cjr.status, cjr.created_at AS datetime FROM club_join_requests cjr JOIN users u ON cjr.user_id = u.id JOIN clubs c ON cjr.club_id = c.id ORDER BY cjr.created_at DESC');
    $joins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($joins as &$j) {
        $j['name'] = trim($j['firstName'] . ' ' . $j['lastName']);
    }
    sendJson(['success' => true, 'data' => $joins]);
}

function handleTransitJoinRequests(): void {
    $auth = requireJwt();
    global $pdo;
    $username = trim($_GET['username'] ?? '');
    if ($auth['role'] !== 'admin' && !$username) {
        sendJson(['success' => false, 'error' => 'username parameter required'], 400);
    }

    if ($auth['role'] !== 'admin') {
        $username = $auth['email'];
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(:value) OR LOWER(email) = LOWER(:value) LIMIT 1');
    $stmt->execute([':value' => strtolower($username)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        sendJson(['success' => false, 'error' => 'User not found'], 404);
    }

    $stmt = $pdo->prepare('SELECT tjr.id, r.name AS route, tjr.status, tjr.created_at AS createdAt FROM transit_join_requests tjr JOIN transit_routes r ON tjr.route_id = r.id WHERE tjr.user_id = ? ORDER BY tjr.created_at DESC');
    $stmt->execute([$user['id']]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJson(['success' => true, 'data' => $requests]);
}
