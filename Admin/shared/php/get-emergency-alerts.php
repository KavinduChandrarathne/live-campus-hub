<?php
header('Content-Type: application/json');

// Path to JSON file
$alertsFile = __DIR__ . '/../json/emergency-alerts.json';

$agents = [];

if (file_exists($alertsFile)) {
    $content = file_get_contents($alertsFile);
    if ($content) {
        $alerts = json_decode($content, true) ?? [];
        
        // Filter only active alerts and those that haven't expired
        $now = new DateTime();
        $activeAlerts = [];
        
        foreach ($alerts as $alert) {
            if ($alert['status'] === 'active') {
                $activeUntil = new DateTime($alert['activeUntil']);
                if ($activeUntil > $now) {
                    $activeAlerts[] = $alert;
                }
            }
        }
        
        echo json_encode(['success' => true, 'alerts' => $activeAlerts]);
    } else {
        echo json_encode(['success' => true, 'alerts' => []]);
    }
} else {
    echo json_encode(['success' => true, 'alerts' => []]);
}
?>
