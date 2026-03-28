<?php
// Database import script - imports campus_hub.sql
header('Content-Type: application/json');

try {
    // First, connect without selecting a database to create it
    $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Drop the existing database if it exists (fresh start)
    $pdo->exec('DROP DATABASE IF EXISTS campus_hub');
    
    // Read the SQL file
    $sqlFile = __DIR__ . '/../campus_hub.sql';
    if (!file_exists($sqlFile)) {
        die(json_encode(['success' => false, 'error' => 'SQL file not found at ' . $sqlFile]));
    }

    $sql = file_get_contents($sqlFile);
    if (!$sql) {
        die(json_encode(['success' => false, 'error' => 'SQL file is empty']));
    }

    // Split by semicolon but be careful with string literals
    $statements = [];
    $currentStatement = '';
    $inString = false;
    $stringChar = '';
    
    for ($i = 0; $i < strlen($sql); $i++) {
        $char = $sql[$i];
        
        if (($char === '"' || $char === "'") && ($i === 0 || $sql[$i-1] !== '\\')) {
            if (!$inString) {
                $inString = true;
                $stringChar = $char;
            } elseif ($char === $stringChar) {
                $inString = false;
            }
        }
        
        if ($char === ';' && !$inString) {
            $statements[] = trim($currentStatement);
            $currentStatement = '';
        } else {
            $currentStatement .= $char;
        }
    }
    
    if (trim($currentStatement)) {
        $statements[] = trim($currentStatement);
    }
    
    // Filter empty statements
    $statements = array_filter($statements, function($s) {
        return !empty($s);
    });

    $count = 0;
    foreach ($statements as $statement) {
        if (!empty(trim($statement))) {
            $pdo->exec($statement);
            $count++;
        }
    }

    echo json_encode([
        'success' => true, 
        'message' => 'Database imported successfully',
        'statements_executed' => $count
    ]);
    exit;
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Database error: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]);
    exit;
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Error: ' . $e->getMessage()
    ]);
    exit;
}
