<?php
/* smtp-test.php: ONE-TIME test. Visit this page once in your browser:
   https://strongmomquotes.com/smtp-test.php?to=YOUR-personal@gmail.com
   It sends a test email via SMTP and shows the exact result.
   DELETE THIS FILE once email works. */
header('Content-Type: text/plain; charset=UTF-8');
require __DIR__ . '/config.php';       // loads secrets into constants + $TP/$SMQ secrets
require __DIR__ . '/smtp_mailer.php';

// pull the secrets array again (config.php already read it, but we need the raw array)
$secrets = [];
foreach ([
    dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/strongmomquotes_private/secrets.php',
    dirname(__DIR__) . '/strongmomquotes_private/secrets.php',
] as $p) { if (is_readable($p)) { $secrets = include $p; break; } }

echo "=== SMTP test ===\n";
echo "smtp_host: " . ($secrets['smtp_host'] ?? '(not set, will default smtp.hostinger.com)') . "\n";
echo "smtp_port: " . ($secrets['smtp_port'] ?? '(not set, will default 465)') . "\n";
echo "smtp_user: " . ($secrets['smtp_user'] ?? ($secrets['from_email'] ?? '(none)')) . "\n";
echo "smtp_pass: " . (!empty($secrets['smtp_pass']) ? 'SET (' . strlen($secrets['smtp_pass']) . ' chars)' : 'NOT SET  <-- add it to secrets.php') . "\n";
echo "from_email: " . ($secrets['from_email'] ?? '(none)') . "\n\n";

$to = $_GET['to'] ?? ($secrets['notify_email'] ?? '');
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    echo "Add ?to=your@email.com to the URL to send a test.\n"; exit;
}

$cfg = [
    'host' => $secrets['smtp_host'] ?? 'smtp.hostinger.com',
    'port' => $secrets['smtp_port'] ?? 465,
    'user' => $secrets['smtp_user'] ?? ($secrets['from_email'] ?? ''),
    'pass' => $secrets['smtp_pass'] ?? '',
    'from' => $secrets['from_email'] ?? '',
    'from_name' => 'Strong Mom Quotes',
];
if (empty($cfg['pass'])) { echo "STOP: smtp_pass is not set in secrets.php. Add it, then retry.\n"; exit; }

$err = null;
$ok = smtp_send($cfg, $to, 'SMQ SMTP test', "This is a test from strongmomquotes.com.\nIf you can read this, SMTP works.\n", $err);
echo $ok ? "RESULT: SUCCESS. Email sent to $to. Check inbox and spam.\n"
         : "RESULT: FAILED: $err\n";
echo "\nRemember to DELETE smtp-test.php when done.\n";
