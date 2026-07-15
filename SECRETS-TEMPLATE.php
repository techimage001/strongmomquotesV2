<?php
/* ============================================================
   SECRETS TEMPLATE FOR STRONG MOM QUOTES

   DO NOT PUT THIS FILE IN public_html AND DO NOT COMMIT IT TO GIT.

   Create it by hand in Hostinger File Manager at:
       domains/strongmomquotes.com/strongmomquotes_private/secrets.php
   (that folder sits NEXT TO public_html, not inside it)

   Then fill in the three values below. Full walkthrough in
   SECRETS-SETUP.md.
   ============================================================ */
return [
    /* Your admin password for leads.php. Make it long and unique. */
    'ADMIN_PASSWORD' => 'PUT-A-LONG-UNIQUE-PASSWORD-HERE',

    /* A random string, 32+ characters. Used to sign the anti-bot token
       and to hash IP addresses. Must MATCH the salt served to the front
       end, which subscribe.php?config=1 does automatically, so you only
       ever set it here. Generate one with a password manager. */
    'SITE_SALT' => 'PUT-A-RANDOM-32-PLUS-CHARACTER-STRING-HERE',

    /* Where new verified signups are announced. */
    'NOTIFY_EMAIL' => 'info@strongmomquotes.com',
];
