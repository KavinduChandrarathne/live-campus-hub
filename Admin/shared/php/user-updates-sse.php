<?php
// Server-Sent Events endpoint that notifies when users.json changes.
// Clients pass ?username=... but we ignore it here: we just watch the file.

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
// no closing of connection

$filename = __DIR__ . '/../json/users.json';
$lastUserMod = 0;
$updatesFile = __DIR__ . '/../json/transit-updates.json';
$lastUpdateMod = 0;

// send a keepalive comment every 15 seconds to prevent timeouts
$keepalive = 0;

while (true) {
    clearstatcache(false);
    // check user file
    $mod = file_exists($filename) ? filemtime($filename) : 0;
    if ($mod > $lastUserMod) {
        $lastUserMod = $mod;
        echo "event: userupdate\n";
        echo "data: {$mod}\n\n";
        @flush();
    }

    // check transit updates file
    $mod2 = file_exists($updatesFile) ? filemtime($updatesFile) : 0;
    if ($mod2 > $lastUpdateMod) {
        $lastUpdateMod = $mod2;
        echo "event: transitupdate\n";
        echo "data: {$mod2}\n\n";
        @flush();
    }

    // keepalive comment
    $keepalive++;
    if ($keepalive > 14) {
        echo ": keepalive\n\n";
        @flush();
        $keepalive = 0;
    }
    sleep(1);
}
