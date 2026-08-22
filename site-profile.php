<?php
/* ============================================================
   SITE PROFILE — Strong Mom Quotes
   ------------------------------------------------------------
   This is the ONLY file that tells the Bulk Content Optimiser
   anything about this website. The engine itself is identical on
   every site. To set the writer up on another site, copy this
   file across and change the values.

   It holds no passwords and no API keys. Those live in the
   database outside public_html.
   ============================================================ */

$v = 7;   /* asset cache-buster; match the ?v= on styles.css sitewide */

return [

    /* ---------- Identity ---------- */
    'site_name'  => 'Strong Mom Quotes',
    'site_url'   => 'https://strongmomquotes.com',
    'brand_html' => 'Strong<em style="color:#D4A24A;font-style:normal">Mom</em>Quotes',
    'author'     => 'Strong Mom Quotes',
    'schema_logo'=> 'https://strongmomquotes.com/icon-512.png',

    /* ---------- Where generated content is written ---------- */
    'blog_path'    => '/blog',
    'page_path'    => '/p',
    'uploads_path' => '/uploads/blog',

    /* ---------- Blog landing copy ---------- */
    'blog_h1'        => 'The Strong Mom Quotes Blog',
    'blog_intro'     => 'Honest writing about motherhood, the words that help, and how to say what you mean.',
    'blog_seo_title' => 'Blog: Honest Writing About Motherhood and the Right Words',
    'blog_seo_desc'  => 'Practical, honest articles about motherhood, mom guilt, captions, cards and finding the right words. Free to read.',
    'related_heading'=> 'Keep reading',

    /* ---------- Look ---------- */
    'theme_color'    => '#B04B66',
    'og_default'     => 'https://strongmomquotes.com/og/home.png',
    'body_class'     => '',
    'brand_rgb'       => [0xB0, 0x4B, 0x66],
    'brand_rgb_dark'  => [0x8E, 0x3A, 0x52],
    'brand_rgb_gold'  => [0xD4, 0xA2, 0x4A],
    'brand_rgb_paper' => [0xFF, 0xFD, 0xFB],

    'head_extra' => <<<HTML
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&family=Karla:wght@400;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v={$v}">
<link rel="stylesheet" href="/blog/blog.css?v={$v}">
HTML,

    'header_html' => <<<HTML
<header class="site"><div class="wrap"><nav class="nav" aria-label="Main">
<a class="logo" href="/">Strong<em>Mom</em>Quotes</a>
<span class="spacer"></span>
<a class="link hidesm" href="/tools.html">Find Words</a>
<a class="link hidesm" href="/blog/">Blog</a>
<a class="link hidesm" href="/collections-hub.html">Collections</a>
<a class="link hidesm" href="/#how">How it works</a>
<a class="link hidesm" href="/contact.html">Contact</a>
<a class="btn navcta" href="/app.html">Open the Card Maker</a>
<span class="acct" id="acct"></span>
<button class="navtoggle" id="navToggle" aria-label="Open menu" aria-controls="navDrawer" aria-expanded="false">&#9776;</button>
</nav>
<div class="navdrawer" id="navDrawer">
<a href="/tools.html">Find Words</a>
<a href="/blog/">Blog</a>
<a href="/collections-hub.html">Collections</a>
<a href="/#how">How it works</a>
<a href="/contact.html">Contact</a>
<a class="btn" href="/app.html">Open the Card Maker</a>
</div>
</div></header>
HTML,

    'footer_html' => '<footer class="mega"><div class="wrap">'
        . '<div><h3>Popular collections</h3><ul>'
        . '<li><a href="/strong-mom-quotes.html">Strong Mom Quotes</a></li>'
        . '<li><a href="/funny-mom-quotes.html">Funny Mom Quotes</a></li>'
        . '<li><a href="/single-mom-quotes.html">Single Mom Quotes</a></li>'
        . '<li><a href="/affirmations-for-moms.html">Affirmations for Moms</a></li>'
        . '<li><a href="/all-quotes.html">Every collection A to Z</a></li></ul></div>'
        . '<div><h3>Free tools</h3><ul>'
        . '<li><a href="/app.html">Quote Card Maker</a></li>'
        . '<li><a href="/tools.html">Find the right words</a></li>'
        . '<li><a href="/generators.html">Message writers</a></li>'
        . '<li><a href="/blog/">Blog</a></li></ul></div>'
        . '<div><h3>Why Strong Mom Quotes</h3><ul>'
        . '<li><a href="/#free">All Free Features</a></li>'
        . '<li><a href="/#how">How it works</a></li>'
        . '<li><a href="/#faq">FAQ</a></li></ul></div>'
        . '<div><h3>Site</h3><ul>'
        . '<li><a href="/contact.html">Contact us</a></li>'
        . '<li><a href="/privacy.html">Privacy policy</a></li>'
        . '<li><a href="/terms.html">Terms of use</a></li>'
        . '<li><a href="/how-we-write-our-quotes.html">How we write our quotes</a></li></ul></div>'
        . '</div><p class="legal">&copy; ' . date('Y') . ' Strong Mom Quotes. All original quotes on this site are the property of Strong Mom Quotes. The tools on this site are currently free to use.</p>'
        . '</div></footer>'
        . '<script src="/site.js?v=' . $v . '" defer></script>',

    /* ---------- Block at the foot of every article ---------- */
    'cta_html' => '<aside class="post-cta">'
        . '<h2>Turn any line into a card</h2>'
        . '<p>Every quote on Strong Mom Quotes is original and free to use. Open the free card maker and put your favourite words on a card you can print, post or send.</p>'
        . '<a class="btn" href="/app.html">Open the Card Maker</a></aside>',

    /* ---------- Starter categories, seeded once ---------- */
    'categories' => [
        ['Motherhood & Wellbeing',  'motherhood-and-wellbeing',  'Honest, practical writing about looking after yourself while you look after everyone else.'],
        ['Mom Guilt & Burnout',     'mom-guilt-and-burnout',     'What mom guilt and burnout actually feel like, and what genuinely helps when you are running on empty.'],
        ['Single Parents & Dads',   'single-parents-and-dads',   'Writing for single parents and for dads, in their own voice rather than borrowed from anyone else.'],
        ['Card Ideas & Printables', 'card-ideas-and-printables', 'Ideas, walkthroughs and inspiration for making cards, prints and gifts with your own words.'],
        ['Captions & Social',       'captions-and-social',       'How to write captions that sound like you, for Instagram, Pinterest and everywhere else.'],
        ['Occasions & Gifts',       'occasions-and-gifts',       'Mother\'s Day, birthdays, new babies and every other moment that needs the right words.'],
        ['Writing Your Own Words',  'writing-your-own-words',    'Simple, repeatable ways to write a message, a letter or a card in your own voice.'],
    ],

    /* ---------- Defaults the Settings screen starts from ---------- */
    'country'          => 'UK',
    'word_min'         => 1500,
    'word_max'         => 3000,
    'default_status'   => 'draft',

    /* Off for this site. Strong Mom Quotes sells original human words;
       an article stuffed with ten government citations undercuts that.
       Switch it on in Settings for a directory or YMYL site. */
    'authority_mode'   => '0',

    'homepage_anchor'  => 'free quote card maker and original mom quotes',
    'default_audience' => 'Mothers and parents, UK and US, reading on a phone, usually tired',

    'house_rules' => "Every quote on this site is original and unattributed. NEVER attribute a quote to a real person, living or dead, and never imply a quote is famous.\n"
        . "No toxic positivity. Acknowledge the hard part before offering the lift.\n"
        . "No medical, diagnostic or clinical advice. Point to a GP or health visitor where something is genuinely medical.\n"
        . "Never promise outcomes and never use 'forever' or 'for life' as a product claim.\n"
        . "Write like a person who has actually been tired at 3am, not like a brand.",

    /* ---------- Internal linking ---------- */
    'internal_links' => 'scan',   /* reads the real .html files, so no URL is ever invented */
    'always_link'    => [
        ['url' => '/app.html',   'title' => 'Free quote card maker'],
        ['url' => '/tools.html', 'title' => 'Find the right words'],
    ],
];
