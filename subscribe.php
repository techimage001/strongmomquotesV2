<?php
/* Strong Mom Quotes: signup collector (V3).
   Seven layers: honeypot, time trap, JS SHA-256 token with per-site
   salt, IP-hash rate limit, validation (format, MX, disposable,
   dedupe), and EMAIL VERIFICATION: nothing counts as a lead until the
   one-click link in the inbox is clicked. Fail open on server errors,
   never auto-verify. No CAPTCHA, by design. */
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/smtp_mailer.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

function db(): ?PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $dir = DB_PRIMARY_DIR;
    if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
    if (!is_dir($dir) || !is_writable($dir)) {
        $dir = DB_FALLBACK_DIR;
        if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
        $ht = $dir . '/.htaccess';
        if (is_dir($dir) && !file_exists($ht)) { @file_put_contents($ht, "Require all denied\n"); }
    }
    if (!is_dir($dir) || !is_writable($dir)) return null;
    try {
        $pdo = new PDO('sqlite:' . $dir . '/' . DB_FILENAME);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            ip_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            verified INTEGER NOT NULL DEFAULT 0,
            verified_at TEXT,
            verify_token TEXT,
            token_expires TEXT
        )');
        $pdo->exec('CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL,
            created_at TEXT NOT NULL
        )');
        return $pdo;
    } catch (Throwable $e) {
        return null;
    }
}

function ip_hash(): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return hash('sha256', $ip . '|' . SITE_SALT);
}

/* --- Public config endpoint: the front end hard-codes nothing. --- */
if (($_GET['config'] ?? '') === '1') {
    respond(200, [
        'ok' => true,
        'salt' => SITE_SALT,
        'freeUses' => 3,
        'minSeconds' => MIN_SUBMIT_SECONDS,
        'configured' => SECRETS_PRESENT
    ]);
}

/* --- Gate-shown beacon --- */
if (($_GET['event'] ?? '') === 'gate') {
    $pdo = db();
    if ($pdo) {
        try {
            $st = $pdo->prepare('INSERT INTO events (kind, created_at) VALUES (?, ?)');
            $st->execute(['gate_shown', gmdate('c')]);
        } catch (Throwable $e) { /* never block */ }
    }
    respond(200, ['ok' => true]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$raw = file_get_contents('php://input');
$data = json_decode((string)$raw, true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'Please try again.']);
}

$mode = (string)($data['mode'] ?? 'signup');   /* signup | signin */
$email = strtolower(trim((string)($data['email'] ?? '')));
$ts = (int)($data['ts'] ?? 0);
$token = (string)($data['token'] ?? '');
$honeypot = (string)($data['website'] ?? '');

/* Layer 1: honeypot. Bots fill it; humans never see it. Fake success. */
if ($honeypot !== '') {
    respond(200, ['ok' => true, 'status' => 'pending']);
}

/* Layer 2: time trap. */
$elapsedMs = (int)(microtime(true) * 1000) - $ts;
if ($ts <= 0 || $elapsedMs < MIN_SUBMIT_SECONDS * 1000) {
    respond(400, ['ok' => false, 'error' => 'Please take a moment and try again.']);
}

/* Layer 3: JS-computed token. curl and simple scripts fail here. */
$expected = hash('sha256', $email . '|' . $ts . '|' . SITE_SALT);
if (!SECRETS_PRESENT || $token === '' || !hash_equals($expected, $token)) {
    respond(400, ['ok' => false, 'error' => 'Please refresh the page and try again.']);
}

/* Layer 5a: format. */
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['ok' => false, 'error' => 'That email address does not look right. Please check it.']);
}

$pdo = db();

/* --- SIGN IN: a previously verified email unlocks any device instantly. --- */
if ($mode === 'signin') {
    if ($pdo === null) {
        respond(500, ['ok' => false, 'error' => 'Server storage unavailable.']);
    }
    try {
        $st = $pdo->prepare('SELECT verified FROM leads WHERE email = ?');
        $st->execute([$email]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        respond(500, ['ok' => false, 'error' => 'Server storage unavailable.']);
    }
    if ($row && (int)$row['verified'] === 1) {
        respond(200, ['ok' => true, 'status' => 'verified']);
    }
    if ($row) {
        respond(400, ['ok' => false, 'error' => 'That email is not confirmed yet. Please click the link in the email we sent you.']);
    }
    respond(400, ['ok' => false, 'error' => 'We have no account for that email yet. Sign up below, it is free.']);
}

/* Layer 4: rate limit per IP hash. */
if ($pdo) {
    try {
        $st = $pdo->prepare('SELECT COUNT(*) FROM leads WHERE ip_hash = ? AND created_at > ?');
        $st->execute([ip_hash(), gmdate('c', time() - 3600)]);
        if ((int)$st->fetchColumn() >= RATE_LIMIT_PER_HOUR) {
            respond(400, ['ok' => false, 'error' => 'Too many signups from this connection. Please try again later.']);
        }
    } catch (Throwable $e) { /* continue */ }
}

/* Layer 5b: disposable blocklist. */
$domain = substr($email, strrpos($email, '@') + 1);
$disposable = ['mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','temp-mail.org','yopmail.com','trashmail.com','sharklasers.com','getnada.com','dispostable.com','maildrop.cc','fakeinbox.com','mintemail.com','throwawaymail.com','mailnesia.com','emailondeck.com','tempinbox.com'];
if (in_array($domain, $disposable, true)) {
    respond(400, ['ok' => false, 'error' => 'Please use a regular email address.']);
}

/* Layer 5c: the domain must actually accept mail. */
if (function_exists('checkdnsrr') && !checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
    respond(400, ['ok' => false, 'error' => 'That email domain does not appear to exist. Please check it.']);
}

if ($pdo === null) {
    respond(500, ['ok' => false, 'error' => 'Server storage unavailable.']);
}

/* Layer 5d: dedupe, and resend for anyone still pending. */
try {
    $st = $pdo->prepare('SELECT id, verified FROM leads WHERE email = ?');
    $st->execute([$email]);
    $existing = $st->fetch(PDO::FETCH_ASSOC);

    if ($existing && (int)$existing['verified'] === 1) {
        respond(200, ['ok' => true, 'status' => 'verified']);
    }

    $verifyToken = bin2hex(random_bytes(16)); /* 32 characters */
    $expires = gmdate('c', time() + VERIFY_EXPIRY_HOURS * 3600);

    if ($existing) {
        $st = $pdo->prepare('UPDATE leads SET verify_token = ?, token_expires = ?, created_at = ? WHERE id = ?');
        $st->execute([$verifyToken, $expires, gmdate('c'), (int)$existing['id']]);
    } else {
        $st = $pdo->prepare('INSERT INTO leads (email, ip_hash, created_at, verified, verify_token, token_expires) VALUES (?, ?, ?, 0, ?, ?)');
        $st->execute([$email, ip_hash(), gmdate('c'), $verifyToken, $expires]);
    }
} catch (Throwable $e) {
    respond(500, ['ok' => false, 'error' => 'Server storage unavailable.']);
}

/* Layer 6: EMAIL VERIFICATION. This is the wall. Never auto-verify. */
$link = SITE_URL . '/verify.php?t=' . $verifyToken;
$subject = 'Confirm your free Strong Mom Quotes account';
$body = "Welcome to Strong Mom Quotes.\n\n"
      . "Click this link to confirm your email and unlock the free card maker:\n\n"
      . $link . "\n\n"
      . "The link works for " . VERIFY_EXPIRY_HOURS . " hours. It is 100% free: no payment, no card details.\n\n"
      . "If you did not sign up, ignore this email and nothing happens.\n\n"
      . "strongmomquotes.com\n";
global $SMQ_SECRETS; send_mail_smart($SMQ_SECRETS, $email, $subject, $body);

respond(200, ['ok' => true, 'status' => 'pending']);
