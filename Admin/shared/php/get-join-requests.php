<?php
header('Content-Type: application/json');
$requestsFile = '../json/club-join-requests.json';

$requests = [];
if (file_exists($requestsFile)) {
    $json = file_get_contents($requestsFile);
    $requests = json_decode($json, true);
    if (!is_array($requests)) {
        $requests = [];
    }
}

// load user map so we can correct any name/picture mismatches
$usersFile = '../json/users.json';
$userMap = [];
if (file_exists($usersFile)) {
    $ujson = file_get_contents($usersFile);
    $allUsers = json_decode($ujson, true);
    if (is_array($allUsers)) {
        foreach ($allUsers as $u) {
            if (isset($u['studentId'])) {
                $sid = strtoupper(trim($u['studentId']));
                $userMap[$sid] = [
                    'name' => trim(($u['firstName'] ?? '') . ' ' . ($u['lastName'] ?? '')),
                    'picture' => $u['picture'] ?? ''
                ];
            }
        }
    }
}

$changed = false;
foreach ($requests as &$r) {
    if (isset($r['studentId'])) {
        $sid = strtoupper(trim($r['studentId']));
        if (isset($userMap[$sid])) {
            $correctName = $userMap[$sid]['name'];
            $correctPic = $userMap[$sid]['picture'];
            if (($r['name'] ?? '') !== $correctName || ($r['picture'] ?? '') !== $correctPic) {
                $r['name'] = $correctName;
                $r['picture'] = $correctPic;
                $changed = true;
            }
        }
    }
}

// Remove duplicate join requests for the same student+club (keep best status & newest)
$deduped = [];
$originalCount = count($requests);
$priority = function ($status) {
    $status = strtolower(trim($status ?? ''));
    if ($status === 'accepted') return 4;
    if ($status === 'pending') return 3;
    if ($status === 'rejected') return 2;
    return 1;
};

foreach ($requests as $r) {
    if (!isset($r['studentId']) || !isset($r['clubName'])) {
        continue;
    }
    $key = strtoupper(trim($r['studentId'])) . '::' . strtolower(trim($r['clubName']));
    $current = $deduped[$key] ?? null;
    if (!$current) {
        $deduped[$key] = $r;
        continue;
    }

    $currentPriority = $priority($current['status'] ?? '');
    $nextPriority = $priority($r['status'] ?? '');

    // Prefer higher status (accepted > pending > rejected)
    if ($nextPriority > $currentPriority) {
        $deduped[$key] = $r;
        continue;
    }

    // If same priority, keep newest by datetime (if present)
    $currentTime = strtotime($current['datetime'] ?? '');
    $nextTime = strtotime($r['datetime'] ?? '');
    if ($nextTime && $currentTime && $nextTime > $currentTime) {
        $deduped[$key] = $r;
    }
}

$requests = array_values($deduped);

// Don't rewrite the file during read operations - let writes happen only in add-join-request.php
// This prevents data loss from concurrent access
// if ($changed || $originalCount !== count($requests)) {
//     // write back fixes so file stays consistent
//     file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT));
// }

// Ensure memberships recorded in users.json (joinedClubs) show up as accepted requests
// so admin can see members even if the request entry is missing.
$usersJoinedRequests = [];
if (file_exists($usersFile)) {
    $ujson = file_get_contents($usersFile);
    $allUsers = json_decode($ujson, true);
    if (is_array($allUsers)) {
        foreach ($allUsers as $u) {
            if (!isset($u['studentId']) || !isset($u['joinedClubs']) || !is_array($u['joinedClubs'])) {
                continue;
            }
            $sid = strtoupper(trim($u['studentId']));
            $name = trim(($u['firstName'] ?? '') . ' ' . ($u['lastName'] ?? ''));
            $picture = $u['picture'] ?? '';
            foreach ($u['joinedClubs'] as $club) {
                $clubName = trim($club);
                if ($clubName === '') continue;
                $key = $sid . '::' . strtolower($clubName);
                $usersJoinedRequests[$key] = [
                    'name' => $name,
                    'studentId' => $sid,
                    'clubName' => $clubName,
                    'picture' => $picture,
                    'message' => '',
                    'status' => 'accepted',
                    'datetime' => date('Y-m-d H:i:s')
                ];
            }
        }
    }
}

$output = $requests;
$outputKeys = [];
foreach ($output as $r) {
    if (isset($r['studentId']) && isset($r['clubName'])) {
        $k = strtoupper(trim($r['studentId'])) . '::' . strtolower(trim($r['clubName']));
        $outputKeys[$k] = $r;
    }
}

// Merge joinedClubs into output, favoring accepted status
foreach ($usersJoinedRequests as $k => $req) {
    if (!isset($outputKeys[$k])) {
        $output[] = $req;
    } else {
        // ensure existing record is accepted
        if (($outputKeys[$k]['status'] ?? '') !== 'accepted') {
            // find and update in $output
            foreach ($output as &$r) {
                $rk = strtoupper(trim($r['studentId'] ?? '')) . '::' . strtolower(trim($r['clubName'] ?? ''));
                if ($rk === $k) {
                    $r['status'] = 'accepted';
                    break;
                }
            }
            unset($r);
        }
    }
}

echo json_encode($output);
?>