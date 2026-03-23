<?php
header('Content-Type: application/json');
$requestsFile = '../json/club-join-requests.json';
$usersFile = '../json/users.json';
require_once 'reward-utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $studentId = isset($_POST['studentId']) ? trim($_POST['studentId']) : null;
    $clubName = isset($_POST['clubName']) ? trim($_POST['clubName']) : null;
    $status = isset($_POST['status']) ? trim($_POST['status']) : '';

    if (!$studentId || !$clubName || $status === '') {
        echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        exit;
    }

    if (!file_exists($requestsFile)) {
        echo json_encode(['success' => false, 'error' => 'Requests file not found']);
        exit;
    }

    $json = file_get_contents($requestsFile);
    $requests = json_decode($json, true);
    if (!is_array($requests)) {
        $requests = [];
    }

    // Find the request by studentId and clubName
    $index = null;
    $studentIdNorm = strtoupper(trim($studentId));
    $clubNameNorm = strtolower(trim($clubName));
    
    foreach ($requests as $i => $req) {
        if (isset($req['studentId']) && isset($req['clubName'])) {
            $reqStudentId = strtoupper(trim($req['studentId']));
            $reqClubName = strtolower(trim($req['clubName']));
            if ($reqStudentId === $studentIdNorm && $reqClubName === $clubNameNorm) {
                $index = $i;
                break;
            }
        }
    }

    // If not found in requests file, it might be a user who's only in joinedClubs
    $requestFoundInFile = ($index !== null);

    // Determine the old status
    $oldStatus = 'pending';
    if ($requestFoundInFile) {
        $oldStatus = $requests[$index]['status'] ?? 'pending';
        $requests[$index]['status'] = $status;
    }

    // Update user's joinedClubs
    $users = [];
    if (file_exists($usersFile)) {
        $uj = file_get_contents($usersFile);
        $users = json_decode($uj, true);
        if (!is_array($users)) {
            $users = [];
        }
    }

    foreach ($users as &$u) {
        if (isset($u['studentId']) && strtoupper(trim($u['studentId'])) === $studentIdNorm) {
            if (!isset($u['joinedClubs']) || !is_array($u['joinedClubs'])) {
                $u['joinedClubs'] = [];
            }
            
            // Search for club in joinedClubs (case-insensitive)
            $clubIndex = -1;
            foreach ($u['joinedClubs'] as $idx => $club) {
                if (strtolower(trim($club)) === $clubNameNorm) {
                    $clubIndex = $idx;
                    break;
                }
            }
            
            // Track first club era
            $initialClubCount = count($u['joinedClubs']);

            if ($status === 'accepted' && $oldStatus !== 'accepted') {
                if ($clubIndex === -1) {
                    $u['joinedClubs'][] = trim($clubName);
                }

                // Rewards on club join
                awardUserPoints($u, 20, 0, false, 'Joining a club');
                if ($initialClubCount === 0) {
                    awardUserPoints($u, 10, 0, false, 'First club joined');
                }
            } elseif ($status === 'removed') {
                // Remove from joinedClubs - either it was accepted or it's not in the request file
                if (!$requestFoundInFile || $oldStatus === 'accepted') {
                    if ($clubIndex !== -1) {
                        array_splice($u['joinedClubs'], $clubIndex, 1);
                    }
                }
            }
            break;
        }
    }

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    
    // Only write requests file if we found and modified the request in it
    if ($requestFoundInFile) {
        file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT));
    }

    echo json_encode(['success' => true]);
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}
