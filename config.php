<?php
/* ============================================================
   STRONG MOM QUOTES: CONFIGURATION
   THIS FILE CONTAINS ZERO SECRETS AND IS SAFE IN GIT.
   All secrets are read at runtime from a secrets file that you
   create BY HAND on the server, OUTSIDE public_html, so that git
   deploys can never touch, overwrite or leak it.
   See SECRETS-SETUP.md. Template: SECRETS-TEMPLATE.php
   ============================================================ */
declare(strict_types=1);

/* Where the hand-created secrets file lives. Checked in order. */
$SMQ_SECRET_PATHS = [
    dirname(__DIR__) . '/strongmomquotes_private/secrets.php',
    dirname(__DIR__, 2) . '/strongmomquotes_private/secrets.php',
    __DIR__ . '/../strongmomquotes_private/secrets.php',
];

$SMQ_SECRETS = ['ADMIN_PASSWORD' => '', 'SITE_SALT' => '', 'NOTIFY_EMAIL' => ''];
foreach ($SMQ_SECRET_PATHS as $p) {
    if (is_readable($p)) {
        $loaded = require $p;
        if (is_array($loaded)) { $SMQ_SECRETS = array_merge($SMQ_SECRETS, $loaded); }
        break;
    }
}

/* FAIL SAFE: with no secrets file, the admin panel refuses every
   login (it never falls open) and signup notifications switch off.
   The public site keeps working. */
define('SECRETS_PRESENT', $SMQ_SECRETS['ADMIN_PASSWORD'] !== '' && $SMQ_SECRETS['SITE_SALT'] !== '');
define('ADMIN_PASSWORD', (string)$SMQ_SECRETS['ADMIN_PASSWORD']);
define('SITE_SALT', (string)$SMQ_SECRETS['SITE_SALT']);
define('NOTIFY_EMAIL', (string)($SMQ_SECRETS['NOTIFY_EMAIL'] ?: 'info@strongmomquotes.com'));

/* Public, non-secret settings. Safe in git. */
define('SITE_URL', 'https://strongmomquotes.com');
define('FROM_EMAIL', 'no-reply@strongmomquotes.com');

/* Database: OUTSIDE public_html so deploys can never delete the list. */
define('DB_PRIMARY_DIR', dirname(__DIR__) . '/strongmomquotes_private');
define('DB_FALLBACK_DIR', __DIR__ . '/smq_private');
define('DB_FILENAME', 'smq_leads_k83jd72msq.sqlite');

define('RATE_LIMIT_PER_HOUR', 3);
define('MIN_SUBMIT_SECONDS', 3);
define('VERIFY_EXPIRY_HOURS', 48);
