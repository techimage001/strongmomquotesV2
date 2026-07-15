<?php
/* Strong Mom Quotes: leads admin (V3).
   Password comes from the secrets file outside public_html. If that file
   is missing the panel FAILS SAFE: every login is refused. Verified and
   pending are counted separately, and CSV exports VERIFIED ONLY. */
declare(strict_types=1);
require __DIR__ . '/config.php';
session_start();
header('X-Robots-Tag: noindex, nofollow');

function admin_db(): ?PDO {
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
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

$authed = ($_SESSION['smq_admin'] ?? false) === true;
$loginError = '';

if (isset($_POST['logout'])) {
    $_SESSION['smq_admin'] = false;
    session_destroy();
    header('Location: leads.php');
    exit;
}

if (!$authed && isset($_POST['password'])) {
    if (!SECRETS_PRESENT) {
        /* FAIL SAFE: no secrets file means no admin access, never open access. */
        $loginError = 'Admin is locked because the secrets file is missing. See SECRETS-SETUP.md.';
    } elseif (hash_equals(ADMIN_PASSWORD, (string)$_POST['password'])) {
        $_SESSION['smq_admin'] = true;
        $authed = true;
    } else {
        $loginError = 'Wrong password.';
    }
}

if ($authed) {
    $pdo = admin_db();

    if ($pdo && isset($_POST['delete_id'])) {
        $st = $pdo->prepare('DELETE FROM leads WHERE id = ?');
        $st->execute([(int)$_POST['delete_id']]);
        header('Location: leads.php');
        exit;
    }

    if ($pdo && ($_GET['export'] ?? '') === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="strongmomquotes-verified-leads.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['id', 'email', 'verified_at']);
        foreach ($pdo->query('SELECT id, email, verified_at FROM leads WHERE verified = 1 ORDER BY id') as $row) {
            fputcsv($out, [$row['id'], $row['email'], $row['verified_at']]);
        }
        fclose($out);
        exit;
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Leads admin: Strong Mom Quotes</title>
<style>
body{font-family:system-ui,sans-serif;background:#FBF6F2;color:#37303F;max-width:900px;margin:0 auto;padding:28px 16px;line-height:1.5}
h1{font-size:1.5rem}
.stats{display:flex;gap:14px;flex-wrap:wrap;margin:18px 0}
.stat{background:#fff;border:1px solid #E8DCD6;border-radius:14px;padding:14px 20px;box-shadow:0 2px 10px rgba(55,48,63,.06)}
.stat b{display:block;font-size:1.5rem;color:#A64D63}
table{width:100%;border-collapse:collapse;background:#fff;margin-top:14px;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(55,48,63,.06)}
th,td{padding:9px 12px;border-bottom:1px solid #E8DCD6;text-align:left;font-size:.92rem}
th{background:#37303F;color:#fff}
.pill{font-size:.75rem;font-weight:800;padding:3px 10px;border-radius:999px}
.pill.v{background:#E4F1E6;color:#2E6B3C}
.pill.p{background:#FBEEDC;color:#8A5B14}
input[type=password]{padding:10px;border:1.5px solid #E8DCD6;border-radius:8px;font-size:1rem}
button,.btn{background:#A64D63;color:#fff;border:0;border-radius:999px;padding:9px 18px;font-weight:700;cursor:pointer;font-size:.9rem;text-decoration:none;display:inline-block}
button.small{padding:5px 12px;font-size:.8rem}
.err{color:#A6342B;font-weight:700}
form.inline{display:inline}
</style>
</head>
<body>
<h1>Strong Mom Quotes: leads admin</h1>
<?php if (!$authed): ?>
    <?php if ($loginError !== ''): ?><p class="err"><?= h($loginError) ?></p><?php endif; ?>
    <?php if (!SECRETS_PRESENT): ?>
        <p class="err">Admin is locked because the secrets file is missing. Create it outside public_html as described in SECRETS-SETUP.md, then reload this page.</p>
    <?php endif; ?>
    <form method="post">
        <p><label>Password <input type="password" name="password" autofocus></label></p>
        <p><button type="submit">Log in</button></p>
    </form>
<?php else: ?>
    <?php
    $pdo = admin_db();
    $verified = 0; $pending = 0; $gates = 0; $rows = [];
    if ($pdo) {
        $verified = (int)$pdo->query('SELECT COUNT(*) FROM leads WHERE verified = 1')->fetchColumn();
        $pending  = (int)$pdo->query('SELECT COUNT(*) FROM leads WHERE verified = 0')->fetchColumn();
        try { $gates = (int)$pdo->query("SELECT COUNT(*) FROM events WHERE kind = 'gate_shown'")->fetchColumn(); }
        catch (Throwable $e) { $gates = 0; }
        $rows = $pdo->query('SELECT id, email, created_at, verified, verified_at FROM leads ORDER BY id DESC LIMIT 500')->fetchAll(PDO::FETCH_ASSOC);
    }
    $conversion = $gates > 0 ? round($verified / $gates * 100, 1) : 0;
    ?>
    <div class="stats">
        <div class="stat"><b><?= $verified ?></b>verified leads</div>
        <div class="stat"><b><?= $pending ?></b>pending confirmation</div>
        <div class="stat"><b><?= $gates ?></b>gates shown</div>
        <div class="stat"><b><?= $conversion ?>%</b>gate to verified</div>
    </div>
    <p>
        <a class="btn" href="leads.php?export=csv">Export verified CSV</a>
        <form method="post" class="inline"><button type="submit" name="logout" value="1">Log out</button></form>
    </p>
    <?php if (!$pdo): ?>
        <p class="err">No database yet. It is created automatically at the first signup.</p>
    <?php else: ?>
    <table>
        <tr><th>ID</th><th>Email</th><th>Status</th><th>Signed up (UTC)</th><th>GDPR</th></tr>
        <?php foreach ($rows as $r): $v = (int)$r['verified'] === 1; ?>
        <tr>
            <td><?= (int)$r['id'] ?></td>
            <td><?= h((string)$r['email']) ?></td>
            <td><span class="pill <?= $v ? 'v' : 'p' ?>"><?= $v ? 'VERIFIED' : 'PENDING' ?></span></td>
            <td><?= h((string)$r['created_at']) ?></td>
            <td><form method="post" class="inline" onsubmit="return confirm('Delete this email from the records? This cannot be undone.');">
                <input type="hidden" name="delete_id" value="<?= (int)$r['id'] ?>">
                <button class="small" type="submit">Delete</button>
            </form></td>
        </tr>
        <?php endforeach; ?>
    </table>
    <p style="font-size:.85rem;color:#7A7080;margin-top:12px">Only verified emails are exported. Pending rows are people who signed up but have not clicked the link in their inbox yet, so they are not counted as leads.</p>
    <?php endif; ?>
<?php endif; ?>
</body>
</html>
