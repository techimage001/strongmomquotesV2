<?php
/* Finds the Bulk Content Optimiser engine, which lives OUTSIDE public_html.
   This is the only file that knows where the engine is. If you ever move
   the engine folder, change the paths here and nothing else. */
declare(strict_types=1);

define('BCO_PUBLIC', __DIR__);

$candidates = [
    dirname(__DIR__) . '/bco/boot.php',        // domains/<site>/bco/         <- normal Hostinger layout
    dirname(__DIR__, 2) . '/bco/boot.php',     // one level higher, if your layout differs
    __DIR__ . '/bco/boot.php',                 // last resort: inside public_html
];

foreach ($candidates as $boot) {
    if (is_file($boot)) { require $boot; return; }
}

http_response_code(503);
header('Content-Type: text/html; charset=utf-8');
echo '<!doctype html><meta charset="utf-8"><title>Engine not found</title>'
   . '<div style="font:16px/1.6 system-ui;max-width:640px;margin:12vh auto;padding:0 22px">'
   . '<h1 style="font-size:22px">Bulk Content Optimiser is not installed yet</h1>'
   . '<p>The site is fine. The writer engine just is not where this file expects it.</p>'
   . '<p>Upload the engine so that <code>boot.php</code> sits at:</p>'
   . '<pre style="background:#f4f6f8;padding:12px;border-radius:8px;overflow:auto">'
   . htmlspecialchars(dirname(__DIR__) . '/bco/boot.php') . '</pre>'
   . '<p>That is one level <em>above</em> public_html, so nothing in the engine is reachable by URL.</p></div>';
