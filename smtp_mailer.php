<?php
/* smtp_mailer.php: dependency-free SMTP sender for Hostinger shared hosting.
   No Composer, no PHPMailer. One self-contained function: smtp_send().
   Reads nothing itself; you pass it config + message. Returns [ok, error].

   Works with Hostinger:  smtp.hostinger.com : 465 (SSL)  or  587 (STARTTLS).
*/

function smtp_send($cfg, $to, $subject, $body, &$error = null) {
    $host = $cfg['host']; $port = (int)$cfg['port'];
    $user = $cfg['user']; $pass = $cfg['pass'];
    $from = $cfg['from']; $fromName = $cfg['from_name'] ?? 'Strong Mom Quotes';
    $timeout = 20;

    $ssl = ($port === 465);
    $transport = $ssl ? "ssl://{$host}" : $host;

    $ctx = stream_context_create(['ssl' => [
        'verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true
    ]]);
    $fp = @stream_socket_client("{$transport}:{$port}", $errno, $errstr, $timeout,
            STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { $error = "connect failed: $errstr ($errno)"; return false; }
    stream_set_timeout($fp, $timeout);

    $read = function() use ($fp) {
        $data = '';
        while ($line = fgets($fp, 515)) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $data;
    };
    $cmd = function($c) use ($fp) { fwrite($fp, $c . "\r\n"); };
    $expect = function($resp, $codes) use (&$error) {
        $code = substr($resp, 0, 3);
        if (!in_array($code, (array)$codes, true)) { $error = "unexpected: " . trim($resp); return false; }
        return true;
    };

    $r = $read(); if (!$expect($r, '220')) { fclose($fp); return false; }
    $cmd("EHLO strongmomquotes.com"); $r = $read();
    if (!$expect($r, '250')) { fclose($fp); return false; }

    if (!$ssl) { // STARTTLS on 587
        $cmd("STARTTLS"); $r = $read();
        if (!$expect($r, '220')) { fclose($fp); return false; }
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            $error = "TLS negotiation failed"; fclose($fp); return false;
        }
        $cmd("EHLO strongmomquotes.com"); $r = $read();
        if (!$expect($r, '250')) { fclose($fp); return false; }
    }

    $cmd("AUTH LOGIN"); $r = $read();
    if (!$expect($r, '334')) { fclose($fp); return false; }
    $cmd(base64_encode($user)); $r = $read();
    if (!$expect($r, '334')) { fclose($fp); return false; }
    $cmd(base64_encode($pass)); $r = $read();
    if (!$expect($r, '235')) { $error = "auth failed (check mailbox password): " . trim($r); fclose($fp); return false; }

    $cmd("MAIL FROM:<{$from}>"); $r = $read();
    if (!$expect($r, '250')) { fclose($fp); return false; }
    $cmd("RCPT TO:<{$to}>"); $r = $read();
    if (!$expect($r, ['250','251'])) { fclose($fp); return false; }
    $cmd("DATA"); $r = $read();
    if (!$expect($r, '354')) { fclose($fp); return false; }

    $headers  = "From: " . mb_encode_mimeheader($fromName) . " <{$from}>\r\n";
    $headers .= "Reply-To: {$from}\r\n";
    $headers .= "To: <{$to}>\r\n";
    $headers .= "Subject: " . mb_encode_mimeheader($subject) . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    // dot-stuffing
    $bodyOut = preg_replace('/^\./m', '..', str_replace("\n", "\r\n", $body));
    $cmd($headers . "\r\n" . $bodyOut . "\r\n."); $r = $read();
    if (!$expect($r, '250')) { fclose($fp); return false; }

    $cmd("QUIT"); fclose($fp);
    return true;
}

/* Convenience: read SMTP config from the secrets array + send.
   Falls back to PHP mail() ONLY if smtp_pass is not set, so nothing breaks
   before you add the password. */
function send_mail_smart($secrets, $to, $subject, $body) {
    $from = $secrets['from_email'] ?? 'info@strongmomquotes.com';
    if (!empty($secrets['smtp_pass'])) {
        $cfg = [
            'host' => $secrets['smtp_host'] ?? 'smtp.hostinger.com',
            'port' => $secrets['smtp_port'] ?? 465,
            'user' => $secrets['smtp_user'] ?? $from,
            'pass' => $secrets['smtp_pass'],
            'from' => $from,
            'from_name' => $secrets['from_name'] ?? 'Strong Mom Quotes',
        ];
        $err = null;
        $ok = smtp_send($cfg, $to, $subject, $body, $err);
        if (!$ok) { error_log("SMTP send failed: $err"); }
        return $ok;
    }
    // fallback
    $headers = "From: {$from}\r\nReply-To: {$from}\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    return @mail($to, $subject, $body, $headers);
}
