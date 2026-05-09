<?php

define('JWT_ALGO', 'HS256');

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'livecampushub-secret-change-me');

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJwt(array $payload, int $expiresIn = 86400): string {
    $header = ['alg' => JWT_ALGO, 'typ' => 'JWT'];
    $now = time();
    $payload = array_merge([
        'iat' => $now,
        'exp' => $now + $expiresIn
    ], $payload);

    $base64Header = base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
    $base64Payload = base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    return "$base64Header.$base64Payload." . base64UrlEncode($signature);
}

function verifyJwt(string $token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    [$base64Header, $base64Payload, $base64Signature] = $parts;
    $expectedSignature = base64UrlEncode(hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true));
    if (!hash_equals($expectedSignature, $base64Signature)) {
        return false;
    }

    $payloadJson = base64UrlDecode($base64Payload);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload) || !isset($payload['exp'])) {
        return false;
    }

    if ($payload['exp'] < time()) {
        return false;
    }

    return $payload;
}

function getBearerToken(): ?string {
    $headers = [];
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers['Authorization'] = trim($requestHeaders['Authorization']);
        }
    }

    if (!isset($headers['Authorization'])) {
        return null;
    }

    if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function requireJwt(): array {
    $token = getBearerToken();
    if (!$token) {
        sendJson(['success' => false, 'error' => 'Authorization required'], 401);
    }

    $payload = verifyJwt($token);
    if (!$payload) {
        sendJson(['success' => false, 'error' => 'Invalid or expired token'], 401);
    }

    return $payload;
}

function sendJson($payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
