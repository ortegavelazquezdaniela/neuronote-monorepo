<?php
declare(strict_types=1);

/**
 * NEURONOTE · Motor de auditoría (PHP 8 + MySQL)
 * Configuración, conexión PDO y utilidades de seguridad compartidas.
 */

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

const NN_ROOT = __DIR__ . '/..';

/** Carga audit-engine/.env sin dependencias externas. */
function nn_env(string $key, ?string $default = null): ?string
{
    static $vars = null;
    if ($vars === null) {
        $vars = [];
        $file = NN_ROOT . '/.env';
        if (is_readable($file)) {
            foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
                    continue;
                }
                [$k, $v] = explode('=', $line, 2);
                $vars[trim($k)] = trim($v);
            }
        }
    }
    $value = getenv($key);
    return $value !== false ? $value : ($vars[$key] ?? $default);
}

/** Conexión PDO única: errores como excepciones y sentencias preparadas reales. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            nn_env('DB_HOST', '127.0.0.1'),
            nn_env('DB_PORT', '3306'),
            nn_env('DB_NAME', 'neuronote_audit')
        );
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        // Bases en la nube (p. ej. TiDB Cloud) exigen TLS: DB_SSL_CA apunta al
        // paquete de certificados del sistema y se verifica el certificado del servidor.
        $ca = nn_env('DB_SSL_CA', '');
        if ($ca !== '') {
            $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        }
        $pdo = new PDO($dsn, nn_env('DB_USER', 'root'), nn_env('DB_PASS', ''), $options);
    }
    return $pdo;
}

/** Escapa texto para HTML (protección XSS). */
function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Lee un campo de $_POST como texto limpio, con longitud máxima. */
function post_text(string $key, int $max): string
{
    $v = trim((string) ($_POST[$key] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    $v = preg_replace('/\s+/u', ' ', $v) ?? '';
    return mb_substr($v, 0, $max);
}

/** Lee un número de $_POST validando el rango; null si no es válido. */
function post_number(string $key, float $min, float $max): ?float
{
    $v = filter_var($_POST[$key] ?? null, FILTER_VALIDATE_FLOAT);
    return ($v === false || $v < $min || $v > $max) ? null : (float) $v;
}

/** HTTPS directo o detrás del proxy de la plataforma (TRUST_PROXY=1, como en Render). */
function is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    return nn_env('TRUST_PROXY', '') === '1'
        && strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

function start_session(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => is_https()]);
        session_start();
    }
}

function csrf_token(): string
{
    start_session();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): void
{
    start_session();
    $sent = (string) ($_POST['csrf'] ?? '');
    if (!hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        http_response_code(403);
        exit('Solicitud no válida (CSRF). Recarga la página e inténtalo de nuevo.');
    }
}

/** Panel pericial protegido con HTTP Basic + password_verify. */
function require_admin(): void
{
    $user = nn_env('ADMIN_USER', 'admin');
    $hash = nn_env('ADMIN_PASS_HASH', '');
    $ok = $hash !== ''
        && hash_equals($user, (string) ($_SERVER['PHP_AUTH_USER'] ?? ''))
        && password_verify((string) ($_SERVER['PHP_AUTH_PW'] ?? ''), $hash);
    if (!$ok) {
        header('WWW-Authenticate: Basic realm="NEURONOTE panel pericial", charset="UTF-8"');
        http_response_code(401);
        exit($hash === '' ? 'Configura ADMIN_PASS_HASH en audit-engine/.env' : 'Acceso restringido.');
    }
}

function send_security_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
    header("Content-Security-Policy: default-src 'self'; style-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'");
    if (is_https()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
}

function json_response(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

send_security_headers();
