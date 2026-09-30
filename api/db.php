<?php
require __DIR__ . '/config.php';
function pdo(): PDO
{
    static $p;
    return $p ??= new PDO(DB_DSN, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
}
function out($d, int $c = 200)
{
    http_response_code($c);
    header('Content-Type: application/json');
    echo json_encode($d);
    exit;
}
function post_json(string $url, array $body, array $headers): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => 1, CURLOPT_RETURNTRANSFER => 1, CURLOPT_TIMEOUT => 20, CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers), CURLOPT_POSTFIELDS => json_encode($body)]);
    return json_decode(curl_exec($ch), true) ?: [];
}
function get_json(string $url): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_TIMEOUT => 20]);
    return json_decode(curl_exec($ch), true) ?: [];
}
function set_payment(string $no, string $status, ?string $ref = null)
{
    $s = pdo()->prepare('UPDATE payments p JOIN orders o ON o.id=p.order_id SET p.status=?,p.provider_ref=COALESCE(?,p.provider_ref) WHERE o.order_no=? AND p.status="pending"');
    $s->execute([$status, $ref, $no]);
}
function back(string $result, string $no)
{
    header('Location: ' . BASE_URL . '/index.html#/result/' . $result);
    exit;
}
function sess()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite' => 'Lax']);
        ini_set('session.use_strict_mode', '1');
        session_start();
    }
}
function require_role(string ...$roles): void
{
    sess();
    if (!in_array($_SESSION['urole'] ?? 'customer', $roles, true)) {
        http_response_code(empty($_SESSION['uid']) ? 401 : 403);
        exit(empty($_SESSION['uid']) ? 'Login required' : 'Access denied');
    }
}
function csrf_token(): string
{
    sess();
    return $_SESSION['csrf_token'] ??= bin2hex(random_bytes(32));
}
