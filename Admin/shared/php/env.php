<?php

/**
 * Load environment variables from a local .env file.
 *
 * This is useful for local development when PHP is not running with the variables
 * already available in the web server environment.
 */
function loadEnv($envPath = null) {
    if ($envPath === null) {
        $projectRoot = realpath(__DIR__ . '/../../..');
        $envPath = $projectRoot . '/.env';
    }

    if (!file_exists($envPath)) {
        return false;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $name = trim($parts[0]);
        $value = trim($parts[1]);

        // Remove optional surrounding quotes.
        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }

        if ($name !== '') {
            putenv("$name=$value");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }

    return true;
}
