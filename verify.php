<?php
/* Strong Mom Quotes: email confirmation landing page.
   Validates a 32-character token, enforces the expiry window, marks the
   lead verified, and unlocks the browser it was opened in. */
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/smtp_mailer.php';
header('X-Robots-Tag: noindex, nofollow');

function vdb(): ?PDO {
    foreach ([DB_PRIMARY_DIR, DB_FALLBACK_DIR] as $dir) {
        $path = $dir . '/' . DB_FILENAME;
        if (file_exists($path)) {
            try {
                $pdo = new PDO('sqlite:' . $path);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                return $pdo;
            } catch (Throwable $e) { return null; }
        }
    }
    return null;
}

$token = (string)($_GET['t'] ?? '');
$state = 'invalid';   /* invalid | expired | done | already */
$email = '';

if (preg_match('/^[a-f0-9]{32}$/', $token) === 1) {
    $pdo = vdb();
    if ($pdo) {
        try {
            $st = $pdo->prepare('SELECT id, email, verified, token_expires FROM leads WHERE verify_token = ?');
            $st->execute([$token]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $email = (string)$row['email'];
                if ((int)$row['verified'] === 1) {
                    $state = 'already';
                } elseif (strtotime((string)$row['token_expires']) < time()) {
                    $state = 'expired';
                } else {
                    $up = $pdo->prepare('UPDATE leads SET verified = 1, verified_at = ?, verify_token = NULL WHERE id = ?');
                    $up->execute([gmdate('c'), (int)$row['id']]);
                    $state = 'done';
                    global $SMQ_SECRETS; send_mail_smart($SMQ_SECRETS, NOTIFY_EMAIL, 'New verified Strong Mom Quotes signup', "Verified signup: {$email}\nTime (UTC): " . gmdate('c') . "\n");
                }
            }
        } catch (Throwable $e) { $state = 'invalid'; }
    }
}

$unlock = ($state === 'done' || $state === 'already');
$titles = [
    'done' => 'You are all set',
    'already' => 'Already confirmed',
    'expired' => 'That link has expired',
    'invalid' => 'That link did not work'
];
$title = $titles[$state];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= htmlspecialchars($title, ENT_QUOTES) ?>: Strong Mom Quotes</title>
<link rel="icon" href="/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&family=Karla:wght@400;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=2">
</head>
<body>
<header class="site"><div class="wrap"><nav class="nav" aria-label="Main">
<a class="logo" href="/">Strong<em>Mom</em>Quotes</a>
<span class="spacer"></span>
<a class="link" href="/#free">All Free Features</a>
</nav></div></header>

<main><div class="wrap" style="max-width:620px;padding:60px 20px">
<div class="verify-card">
  <span class="crest" aria-hidden="true"><?= $unlock ? '&#10003;' : '&#9888;' ?></span>
  <h1><?= htmlspecialchars($title, ENT_QUOTES) ?></h1>
  <?php if ($state === 'done'): ?>
    <p>Your email is confirmed and the card maker is unlocked. Enjoy, and welcome.</p>
    <p class="bigfree"><strong>100% FREE right now. No payment, no card details, ever requested.</strong></p>
    <p><a class="btn" href="/app.html">Start making cards</a></p>
  <?php elseif ($state === 'already'): ?>
    <p>This email was already confirmed, so there is nothing left to do. The card maker is unlocked on this device too.</p>
    <p><a class="btn" href="/app.html">Open the card maker</a></p>
  <?php elseif ($state === 'expired'): ?>
    <p>Confirmation links work for <?= (int)VERIFY_EXPIRY_HOURS ?> hours. Enter your email again on the card maker and we will send you a fresh one straight away.</p>
    <p><a class="btn" href="/app.html">Back to the card maker</a></p>
  <?php else: ?>
    <p>The link may have been copied incompletely. Try clicking it again from your email, or enter your email on the card maker to get a new one.</p>
    <p><a class="btn" href="/app.html">Back to the card maker</a></p>
  <?php endif; ?>
</div>
<p class="note center" style="margin-top:18px">Questions: <a href="mailto:info@strongmomquotes.com">info@strongmomquotes.com</a></p>
</div></main>

<footer class="mega"><div class="wrap">
<p class="legal">&copy; 2026 Strong Mom Quotes &middot; <a href="/">Home</a> &middot; <a href="/privacy.html">Privacy policy</a> &middot; <a href="/terms.html">Terms of use</a> &middot; <a href="/contact.html">Contact</a></p>
</div></footer>

<?php if ($unlock): ?>
<script>
try {
  localStorage.setItem('smq_unlocked', '1');
  localStorage.setItem('smq_email', <?= json_encode($email) ?>);
} catch (e) {}
</script>
<?php endif; ?>
</body>
</html>
