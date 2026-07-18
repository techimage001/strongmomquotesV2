#!/usr/bin/env node
/* Strong Mom Quotes: static page generator (V3).
   Builds every category page with CONTEXTUAL in-body internal links
   (footer links do not count for SEO), the account control, versioned
   assets, and AdSense units. Also regenerates sitemap.xml and injects
   the quote pool into app.html.
   Usage: node tools/build.js */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'quotes.json'), 'utf8'));
const DOMAIN = DATA.domain;
const ADS_CLIENT = 'ca-pub-4138594802747479';
const AD_SLOT = '0000000000'; /* placeholder: swap real slot IDs before launch, see README */
const ASSET_V='7';          /* bump on every release: busts caches for css and js */
const TODAY = new Date().toISOString().slice(0, 10);

/* Editorial grouping drives the "If you like this" blocks. These are
   deliberate pairings, not an automatic dump of every page. */
const RELATED = {
  'strong-mom-quotes':        ['tired-mom-quotes', 'encouraging-quotes-for-moms', 'single-mom-quotes'],
  'short-mom-quotes':         ['funny-mom-quotes', 'mom-quotes-from-daughter', 'strong-mom-quotes'],
  'funny-mom-quotes':         ['tired-mom-quotes', 'short-mom-quotes', 'boy-mom-quotes'],
  'single-mom-quotes':        ['single-mom-affirmations', 'strong-mom-quotes', 'working-mom-quotes'],
  'working-mom-quotes':       ['working-mom-affirmations', 'tired-mom-quotes', 'encouraging-quotes-for-moms'],
  'new-mom-quotes':           ['new-mom-affirmations', 'tired-mom-quotes', 'encouraging-quotes-for-moms'],
  'boy-mom-quotes':           ['girl-mom-quotes', 'funny-mom-quotes', 'strong-mom-quotes'],
  'girl-mom-quotes':          ['boy-mom-quotes', 'mom-quotes-from-daughter', 'affirmations-for-moms'],
  'tired-mom-quotes':         ['encouraging-quotes-for-moms', 'affirmations-for-moms', 'funny-mom-quotes'],
  'encouraging-quotes-for-moms': ['affirmations-for-moms', 'tired-mom-quotes', 'strong-mom-quotes'],
  'mom-quotes-from-daughter': ['classic-mom-quotes', 'short-mom-quotes', 'girl-mom-quotes'],
  'affirmations-for-moms':    ['encouraging-quotes-for-moms', 'single-mom-affirmations', 'working-mom-affirmations'],
  'single-mom-affirmations':  ['single-mom-quotes', 'affirmations-for-moms', 'tired-mom-quotes'],
  'new-mom-affirmations':     ['new-mom-quotes', 'affirmations-for-moms', 'tired-mom-quotes'],
  'working-mom-affirmations': ['working-mom-quotes', 'affirmations-for-moms', 'encouraging-quotes-for-moms'],
  'classic-mom-quotes':       ['mom-quotes-from-daughter', 'strong-mom-quotes', 'short-mom-quotes']
};

/* Which card style suits which page: the tool link, made contextual. */
const THEME_HINT = {
  'strong-mom-quotes': 'Plum dusk and Midnight suit these lines: dark, quiet, unshowy strength.',
  'short-mom-quotes': 'Short lines look best large, so try Blush or Warm paper with the Clean modern font.',
  'funny-mom-quotes': 'Golden hour and the Soft italic font give a joke room to breathe.',
  'single-mom-quotes': 'Raspberry with the Elegant serif reads as proud rather than pitying.',
  'working-mom-quotes': 'Dusty blue and Clean modern make a card that belongs on a desk.',
  'new-mom-quotes': 'Blush and Warm paper are gentle enough for the newborn fog.',
  'boy-mom-quotes': 'Sage calm and Dusty blue hold up well behind a busy day.',
  'girl-mom-quotes': 'Blush with the Soft italic font is the classic pairing here.',
  'tired-mom-quotes': 'Midnight and Plum dusk suit words meant for the end of the day.',
  'encouraging-quotes-for-moms': 'Golden hour was made for this: warm, bright, on her side.',
  'mom-quotes-from-daughter': 'Warm paper prints beautifully if you are putting this in a real card.',
  'affirmations-for-moms': 'Warm paper in the Instagram square size makes a good mirror card.',
  'single-mom-affirmations': 'Raspberry in the story size makes a strong lock screen.',
  'new-mom-affirmations': 'Blush and the story size give you a calm phone background for night feeds.',
  'working-mom-affirmations': 'Dusty blue, Instagram square, and it sits neatly beside a monitor.',
  'classic-mom-quotes': 'Midnight with the Elegant serif treats an old line with the weight it earned.'
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function attr(s) { return esc(s).replace(/'/g, '&#39;'); }

function adUnit() {
  return `<div class="adslot">
<ins class="adsbygoogle" style="display:block" data-ad-client="${ADS_CLIENT}" data-ad-slot="${AD_SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
</div>`;
}

function headBlock(title, description, canonicalPath) {
  const url = DOMAIN + canonicalPath;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="Strong Mom Quotes">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
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
<link rel="stylesheet" href="/styles.css?v=${ASSET_V}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}" crossorigin="anonymous"></script>`;
}

function headerNav() {
  return `<header class="site"><div class="wrap"><nav class="nav" aria-label="Main">
<a class="logo" href="/">Strong<em>Mom</em>Quotes</a>
<span class="spacer"></span>
<a class="link hidesm" href="/#free">All Free Features</a>
<a class="link hidesm" href="/#categories">Categories</a>
<a class="link hidesm" href="/#how">How it works</a>
<a class="link hidesm" href="/#faq">FAQ</a>
<a class="link hidesm" href="/contact.html">Contact</a>
<a class="btn navcta" href="/app.html">Open the Card Maker</a>
<span class="acct" id="acct"></span>
<button class="navtoggle" id="navToggle" aria-label="Open menu" aria-controls="navDrawer" aria-expanded="false">\u2630</button>
</nav>
<div class="navdrawer" id="navDrawer">
<a href="/#free">All Free Features</a>
<a href="/#categories">Categories</a>
<a href="/#how">How it works</a>
<a href="/#faq">FAQ</a>
<a href="/contact.html">Contact</a>
<a class="btn" href="/app.html">Open the Card Maker</a>
</div>
</div></header>`;
}

function footerMega(cats) {
  const catLinks = cats.map(c => `<li><a href="/${c.slug}.html">${esc(c.title)}</a></li>`).join('\n');
  return `<footer class="mega"><div class="wrap">
<div class="cols">
<div><h3>Quote categories</h3><ul>${catLinks}</ul></div>
<div><h3>Free tools</h3><ul>
<li><a href="/app.html">Quote Card Maker</a></li>
<li><a href="/app.html#daily">Today's quote</a></li>
<li><a href="/app.html#mine">Write your own quote</a></li>
<li><a href="/app.html#favorites">Your favorites</a></li>
</ul></div>
<div><h3>Why Strong Mom Quotes</h3><ul>
<li><a href="/#free">All Free Features</a></li>
<li><a href="/#how">How it works</a></li>
<li><a href="/#faq">FAQ</a></li>
<li><a href="/#about">About the quotes</a></li>
</ul></div>
<div><h3>Site</h3><ul>
<li><a href="/contact.html">Contact us</a></li>
<li><a href="/privacy.html">Privacy policy</a></li>
<li><a href="/terms.html">Terms of use</a></li>
</ul></div>
</div>
<p class="legal">&copy; ${new Date().getFullYear()} Strong Mom Quotes. All original quotes on this site are the property of Strong Mom Quotes. Classic quotes are reproduced from verified public domain sources. The tools on this site are currently free to use.</p>
</div></footer>
<script src="/site.js?v=${ASSET_V}" defer></script>`;
}

function quoteCard(q, i) {
  const full = q.text + ' (' + q.by + ')';
  const makerHref = '/app.html?q=' + encodeURIComponent(q.text) + '&by=' + encodeURIComponent(q.by);
  return `<div class="qcard">
<span class="qnum">${String(i + 1).padStart(2, '0')}</span>
<blockquote>&ldquo;${esc(q.text)}&rdquo;</blockquote>
<p class="by">${esc(q.by)}</p>
<div class="tools">
<button type="button" data-copy="${attr(full)}">Copy quote</button>
<a href="${makerHref}">Make this a card</a>
</div>
</div>`;
}

/* CONTEXTUAL internal linking. Footer links are sitewide boilerplate and
   carry little weight; these in-body editorial links are the SEO lever. */
function relatedBlock(cat, byslug) {
  const rel = (RELATED[cat.slug] || []).map(s => byslug[s]).filter(Boolean);
  const relLis = rel.map(c =>
    `<li><a href="/${c.slug}.html">${esc(c.title)}</a>: ${esc(c.blurb)}</li>`
  ).join('\n');
  const hint = THEME_HINT[cat.slug] || 'Any background and font pairing works; the preview updates as you tap.';
  return `<section class="related">
<h2>If you like ${esc(cat.title.toLowerCase())}</h2>
<p class="sub">Three collections our readers move on to next, and the card styles that suit these words.</p>
<div class="cols">
<div><h3>Read next</h3><ul>
${relLis}
</ul></div>
<div><h3>Card styles that suit these</h3><ul>
<li>${esc(hint)}</li>
<li>Open the <a href="/app.html">free card maker</a> and every background, font and size is unlocked from the first tap.</li>
</ul></div>
<div><h3>Free tools to try</h3><ul>
<li><a href="/app.html#daily">Today's quote</a>: a fresh line waiting each day.</li>
<li><a href="/app.html#mine">Write your own quote</a>: your words, the same card styles.</li>
<li><a href="/app.html#favorites">Favorites</a>: keep the ones that land.</li>
</ul></div>
</div>
</section>`;
}

/* Reciprocal links: every category page links back INTO the sibling
   category pages by name, so the graph is two-way, not one-way. */
function popularStrip(cat, cats) {
  const others = cats.filter(c => c.slug !== cat.slug).slice(0, 8);
  const links = others.map(c => `<a href="/${c.slug}.html">${esc(c.title)}</a>`).join('\n');
  return `<section class="popular">
<h2>Popular mom quote collections</h2>
<div class="chips">
${links}
</div>
</section>`;
}

function categoryPage(cat, allCats, byslug) {
  const canonical = '/' + cat.slug + '.html';

  let quoteHtml = '';
  cat.quotes.forEach((q, i) => {
    quoteHtml += quoteCard(q, i) + '\n';
    if ((i + 1) % 6 === 0 && i + 1 < cat.quotes.length) quoteHtml += adUnit() + '\n';
  });

  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strong Mom Quotes', item: DOMAIN + '/' },
      { '@type': 'ListItem', position: 2, name: cat.title, item: DOMAIN + canonical }
    ]
  };
  const webpage = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: cat.metaTitle, description: cat.metaDescription, url: DOMAIN + canonical,
    isPartOf: { '@type': 'WebSite', name: 'Strong Mom Quotes', url: DOMAIN + '/' }
  };

  return `<!doctype html>
<html lang="en">
<head>
${headBlock(cat.metaTitle, cat.metaDescription, canonical)}
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
</head>
<body>
${headerNav()}
<main>
<div class="wrap">
<section class="hero" style="padding-bottom:14px">
<p class="eyebrow">Free to read, copy and share</p>
<h1>${esc(cat.h1)}</h1>
<p style="max-width:720px;margin:16px auto 0">${esc(cat.intro)}</p>
</section>
${adUnit()}
<section aria-label="${attr(cat.title)} list">
<div class="quotelist">
${quoteHtml}
</div>
</section>
${adUnit()}
<section class="band">
<h2>Turn any of these into a picture card</h2>
<p>Every quote above has a <strong>Make this a card</strong> button. It opens our free <a href="/app.html">quote card maker</a> with the quote already loaded: pick a background, pick a size for Pinterest, Instagram or stories, and download your card. Typical quote apps charge a subscription for exactly this. Here it is currently free, with no download and no payment details. See the full <a href="/#free">All Free Features</a> table if you want the comparison.</p>
<p style="margin-top:14px"><a class="btn" href="/app.html">Open the free Card Maker</a> <a class="btn ghost" href="/#free">See everything that is free</a></p>
</section>
${relatedBlock(cat, byslug)}
${popularStrip(cat, allCats)}
</div>
</main>
${footerMega(allCats)}
</body>
</html>
`;
}

/* Build */
const cats = DATA.categories;
const byslug = {};
cats.forEach(c => { byslug[c.slug] = c; });

let linkCount = 0;
cats.forEach(cat => {
  const html = categoryPage(cat, cats, byslug);
  fs.writeFileSync(path.join(ROOT, cat.slug + '.html'), html);
  const bodyOnly = html.split('<footer')[0];
  const inBody = (bodyOnly.match(/href="\/[a-z0-9\-\.#\?]+/gi) || []).length;
  linkCount += inBody;
  console.log('built ' + cat.slug + '.html (' + cat.quotes.length + ' quotes, ' + inBody + ' in-body links)');
});
console.log('contextual in-body links across category pages: ' + linkCount);

/* Sitemap */
const staticPages = ['/', '/app.html', '/contact.html', '/privacy.html', '/terms.html'];
const urls = staticPages.concat(cats.map(c => '/' + c.slug + '.html'));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${DOMAIN}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('built sitemap.xml (' + urls.length + ' urls)');

/* Inject the quote pool into app.html */
const appPath = path.join(ROOT, 'app.html');
if (fs.existsSync(appPath)) {
  const pool = [];
  cats.forEach(c => c.quotes.forEach(q => pool.push({ t: q.text, b: q.by, c: c.title, s: c.slug })));
  let app = fs.readFileSync(appPath, 'utf8');
  const start = '/*POOL_START*/';
  const end = '/*POOL_END*/';
  const i1 = app.indexOf(start), i2 = app.indexOf(end);
  if (i1 !== -1 && i2 !== -1) {
    app = app.slice(0, i1 + start.length) + 'var QUOTE_POOL=' + JSON.stringify(pool) + ';' + app.slice(i2);
    fs.writeFileSync(appPath, app);
    console.log('injected quote pool into app.html (' + pool.length + ' quotes)');
  } else {
    console.log('WARNING: pool markers not found in app.html');
  }
}
console.log('done');
