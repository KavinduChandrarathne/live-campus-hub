<?php
/**
 * DEPRECATED: This file is no longer actively maintained.
 * All reward logic and database functions have been moved to db.php
 * 
 * This file is kept for backward compatibility only. 
 * New code should require_once 'db.php' instead.
 */

// For backward compatibility, include db.php to ensure functions are available
require_once 'db.php';

// Legacy JSON-based functions are no longer available due to database migration
// If you need: getTierInfo() - use getTierInfo($points) from db.php
// If you need: awardUserPoints() - use awardUserPoints($pdo, $userId, ...) from db.php
// If you need: addNotification() - use addNotification($pdo, ...) from db.php

date_default_timezone_set('Asia/Colombo');

// Deprecated function stubs - these no longer work with JSON files
function loadUsers() {
    error_log('reward-utils.php::loadUsers() is deprecated - use database queries instead');
    return [];
}

function saveUsers($users) {
    error_log('reward-utils.php::saveUsers() is deprecated - use database updates instead');
    return false;
}

function findUser(&$users, $emailOrUsernameOrStudentId) {
    error_log('reward-utils.php::findUser() is deprecated - query database instead');
    return null;
}
    }
    return null;
}

function findUserIndex($users, $emailOrUsernameOrStudentId) {
    $needle = trim(strtolower($emailOrUsernameOrStudentId));
    foreach ($users as $idx => $user) {
        if (isset($user['email']) && strtolower($user['email']) === $needle) return $idx;
        if (isset($user['username']) && strtolower($user['username']) === $needle) return $idx;
        if (isset($user['studentId']) && strtolower($user['studentId']) === $needle) return $idx;
    }
    return null;
}
