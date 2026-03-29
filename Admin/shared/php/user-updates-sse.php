<?php
// Server-Sent Events endpoint that notifies when users or transit updates change (via MySQL polling)
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
require_once 'db.php';

$lastUserUpdate = isset($_GET['lastUserUpdate']) ? strtotime($_GET['lastUserUpdate']) : 0;
$lastTransitUpdate = isset($_GET['lastTransitUpdate']) ? strtotime($_GET['lastTransitUpdate']) : 0;

$keepalive = 0;

while (true) {
    try {
        // Check for user updates
        $stmt = $pdo->prepare('SELECT MAX(updated_at) as latest FROM users');
        $stmt->execute();
        $userResult = $stmt->fetch();
        $userTime = strtotime($userResult['latest'] ?? '1970-01-01');

        if ($userTime > $lastUserUpdate) {
            $lastUserUpdate = $userTime;
            echo "event: userupdate\n";
            echo "data: " . date('c', $userTime) . "\n\n";
            @flush();
        }

        // Check for transit updates
        $stmt = $pdo->prepare('SELECT MAX(updated_at) as latest FROM transit_updates');
        $stmt->execute();
        $transitResult = $stmt->fetch();
        $transitTime = strtotime($transitResult['latest'] ?? '1970-01-01');

        if ($transitTime > $lastTransitUpdate) {
            $lastTransitUpdate = $transitTime;
            echo "event: transitupdate\n";
            echo "data: " . date('c', $transitTime) . "\n\n";
            @flush();
        }

        // Keepalive comment every 15 seconds
        $keepalive++;
        if ($keepalive > 14) {
            echo ": keepalive\n\n";
            @flush();
            $keepalive = 0;
        }

        sleep(1);
    } catch (PDOException $e) {
        error_log('SSE error: ' . $e->getMessage());
        sleep(5);
    }
}
