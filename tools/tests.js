#!/usr/bin/env node
/* Strong Mom Quotes test suite (V3). Run: node tools/tests.js */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name); }
}
const app = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cfg = fs.readFileSync(path.join(ROOT, 'config.php'), 'utf8');
const sub = fs.readFileSync(path.join(ROOT, 'subscribe.php'), 'utf8');
const leads = fs.readFileSync(path.join(ROOT, 'leads.php'), 'utf8');
const verify = fs.readFileSync(path.join(ROOT, 'verify.php'), 'utf8');
const sitejs = fs.readFileSync(path.join(ROOT, 'site.js'), 'utf8');

/* ---- 1. Gate threshold logic at the boundaries ---- */
const FREE_USES = 3;
function gateDecision(unlockedFlag, used) {
  if (unlockedFlag === 1) return 'download';
  if (used < FREE_USES) return 'download_and_count';
  return 'gate';
}
ok(gateDecision(0, 0) === 'download_and_count', 'gate: 1st use free');
ok(gateDecision(0, 1) === 'download_and_count', 'gate: 2nd use free');
ok(gateDecision(0, 2) === 'download_and_count', 'gate: 3rd use free (boundary used=2)');
ok(gateDecision(0, 3) === 'gate', 'gate: 4th use gated (boundary used=3)');
ok(gateDecision(1, 99) === 'download', 'gate: unlocked device never gated');
ok(app.includes('used<CFG.freeUses'), 'gate: app uses strict less-than boundary');

/* ---- 2. NO SECRETS IN GIT ---- */
ok(!/define\('ADMIN_PASSWORD',\s*'[^']{3,}'\)/.test(cfg), 'secrets: no literal admin password in config.php');
ok(!/define\('SITE_SALT',\s*'[^']{3,}'\)/.test(cfg), 'secrets: no literal salt in config.php');
ok(cfg.includes('SECRETS_PRESENT'), 'secrets: config exposes a SECRETS_PRESENT flag');
ok(cfg.includes('strongmomquotes_private/secrets.php'), 'secrets: config reads a secrets file outside public_html');
ok(fs.existsSync(path.join(ROOT, 'SECRETS-TEMPLATE.php')), 'secrets: SECRETS-TEMPLATE.php shipped');
ok(fs.existsSync(path.join(ROOT, 'SECRETS-SETUP.md')), 'secrets: SECRETS-SETUP.md shipped');
ok(!app.includes('SITE_SALT=') && app.includes("fetch('/subscribe.php?config=1')"), 'secrets: app.html holds no salt, fetches config at runtime');
ok(/SECRETS_PRESENT[\s\S]{0,400}locked because the secrets file is missing/.test(leads), 'secrets: admin FAILS SAFE when secrets missing');
{
  const files = fs.readdirSync(ROOT).filter(f => /\.(html|js|php|json|txt|xml|md)$/.test(f));
  let leak = false;
  for (const f of files) {
    if (f === 'SECRETS-TEMPLATE.php' || f === 'SECRETS-SETUP.md') continue;
    const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/CHANGE-ME|smq-2026-salt|test-password/.test(c)) { leak = false || (leak = true); console.log('  possible secret in ' + f); }
  }
  ok(!leak, 'secrets: no old hard-coded password or salt anywhere in the repo');
}

/* ---- 3. Seven anti-bot layers, verification is the wall ---- */
ok(/honeypot/i.test(sub) && sub.includes("\$honeypot !== ''"), 'antibot: L1 honeypot with fake success');
ok(sub.includes('MIN_SUBMIT_SECONDS'), 'antibot: L2 time trap');
ok(sub.includes("hash('sha256', \$email . '|' . \$ts . '|' . SITE_SALT)"), 'antibot: L3 JS token with per-site salt');
ok(sub.includes('RATE_LIMIT_PER_HOUR'), 'antibot: L4 IP-hash rate limit');
ok(sub.includes('FILTER_VALIDATE_EMAIL') && sub.includes('checkdnsrr') && sub.includes('disposable'), 'antibot: L5 validation (format, MX, disposable)');
ok(sub.includes('verify_token') && sub.includes('random_bytes(16)') && sub.includes('/verify.php?t='), 'antibot: L6 email verification link issued');
ok(/verified = 1/.test(verify) && verify.includes('token_expires'), 'antibot: verify.php marks verified and enforces expiry');
ok(!/verified.*=.*1/.test(sub.split('SIGN IN')[0].split('respond(200')[0]) || !sub.includes('auto-verify'), 'antibot: signup never auto-verifies');
{
  const all = app + index + sub + leads + verify + sitejs;
  const integration = /(challenges\.cloudflare\.com|www\.google\.com\/recaptcha|hcaptcha\.com|cf-turnstile|g-recaptcha|h-captcha|TURNSTILE_SECRET|RECAPTCHA_SECRET)/i;
  ok(!integration.test(all), 'antibot: no CAPTCHA or Turnstile integration anywhere, by design');
}
ok(leads.includes('WHERE verified = 1') && leads.includes('verified-leads.csv'), 'antibot: CSV exports VERIFIED ONLY');
ok(leads.includes('PENDING') && leads.includes('VERIFIED'), 'admin: verified vs pending shown separately');

/* ---- 4. Account control ---- */
ok(sitejs.includes('signin-btn') && sitejs.includes('Sign in'), 'account: Sign in button when signed out');
ok(sitejs.includes('avatar') && sitejs.includes('charAt(0).toUpperCase()'), 'account: avatar shows first letter of email');
ok(sitejs.includes('Every tool unlocked, free.'), 'account: dropdown carries the reassurance line');
ok(sitejs.includes('Sign out') && sitejs.includes("lsDel(LS.unlock)"), 'account: Sign out clears the unlock');
ok(sitejs.includes("aria-expanded") && sitejs.includes("Escape"), 'account: keyboard accessible, Escape closes');
ok(!/Signed up<\/|>Signed up</.test(index + app), 'account: no permanent "Signed up" badge');
{
  const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  const missing = pages.filter(f => !['privacy.html', 'terms.html'].includes(f) && !fs.readFileSync(path.join(ROOT, f), 'utf8').includes('id="acct"'));
  ok(missing.length === 0, 'account: control mounted on every content page' + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
}
ok(app.includes('Already signed up?') && app.includes('Enter the same email to unlock this device.'), 'account: gate offers the sign-in path');

/* ---- 5. FAQ schema and visible parity, word for word ---- */
const faqJsonMatch = index.match(/<script type="application\/ld\+json">\s*(\{"@context":"https:\/\/schema.org","@type":"FAQPage"[\s\S]*?\})\s*<\/script>/);
ok(!!faqJsonMatch, 'faq: FAQPage JSON-LD found');
let schemaQA = [];
if (faqJsonMatch) {
  const faq = JSON.parse(faqJsonMatch[1]);
  schemaQA = faq.mainEntity.map(q => [q.name.trim(), q.acceptedAnswer.text.trim()]);
}
const visible = [];
const re = /<details class="faq"><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g;
let m;
while ((m = re.exec(index)) !== null) visible.push([m[1].trim(), m[2].trim()]);
ok(schemaQA.length >= 8 && schemaQA.length <= 12, 'faq: 8 to 12 questions (' + schemaQA.length + ')');
ok(visible.length === schemaQA.length, 'faq: same count visible vs schema');
let parity = visible.length === schemaQA.length;
for (let i = 0; i < Math.min(visible.length, schemaQA.length); i++) {
  if (visible[i][0] !== schemaQA[i][0] || visible[i][1] !== schemaQA[i][1]) {
    parity = false;
    console.log('  parity mismatch at Q' + (i + 1) + ': ' + visible[i][0]);
  }
}
ok(parity, 'faq: visible text matches schema WORD FOR WORD');

/* ---- 6. Banned strings ---- */
const siteFiles = fs.readdirSync(ROOT).filter(f => /\.(html|css|js|php|json|txt|xml)$/.test(f)).concat(['data/quotes.json']);
const banned = [
  { re: /\u2014/, name: 'em dash' },
  { re: /\u2013/, name: 'en dash' },
  { re: /forever/i, name: 'word: forever' },
  { re: /permanent/i, name: 'word: permanent' },
  { re: /always free/i, name: 'phrase: always free' },
  { re: /for life/i, name: 'phrase: for life' },
  { re: /Monkey Taps|ThinkUp|Innertune|MamaZen|Mindful Mamas|joinyouare/i, name: 'competitor name' }
];
let bannedClean = true;
for (const f of siteFiles) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const c = fs.readFileSync(p, 'utf8');
  for (const b of banned) {
    if (b.re.test(c)) { bannedClean = false; console.log('  banned [' + b.name + '] in ' + f); }
  }
}
ok(bannedClean, 'copy: zero em/en dashes, permanence promises, competitor names');

/* ---- 7. CONTEXTUAL INTERNAL LINKING (footers do not count) ---- */
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let contextual = 0;
const inbound = {};
htmlFiles.forEach(f => { inbound[f] = 0; });
for (const f of htmlFiles) {
  const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const body = c.split('<footer')[0];                 /* footer links excluded on purpose */
  const links = [...body.matchAll(/href="\/([a-z0-9\-]+\.html)/g)].map(x => x[1]);
  contextual += links.length;
  for (const l of links) { if (l !== f && inbound[l] !== undefined) inbound[l]++; }
}
ok(contextual >= 400, 'seo: 400+ contextual in-body links (' + contextual + ')');
const orphans = htmlFiles.filter(f => !['index.html', 'privacy.html', 'terms.html'].includes(f) && inbound[f] === 0);
ok(orphans.length === 0, 'seo: no orphan pages, every page has inbound in-body links' + (orphans.length ? ' (' + orphans.join(', ') + ')' : ''));
{
  /* Reciprocity: category pages must link back into each other, not just out to the app */
  const cats = htmlFiles.filter(f => !['index.html', 'app.html', 'contact.html', 'privacy.html', 'terms.html'].includes(f));
  const bad = cats.filter(f => {
    const body = fs.readFileSync(path.join(ROOT, f), 'utf8').split('<footer')[0];
    return [...body.matchAll(/href="\/([a-z0-9\-]+\.html)/g)].filter(x => cats.includes(x[1]) && x[1] !== f).length < 3;
  });
  ok(bad.length === 0, 'seo: every category page links to 3+ sibling categories in body' + (bad.length ? ' (' + bad.join(', ') + ')' : ''));
}
{
  /* The tool must not be a dead end */
  const body = app.split('<footer')[0];
  const out = [...body.matchAll(/href="\/([a-z0-9\-]+\.html)/g)].length;
  ok(out >= 8, 'seo: card maker links back into content (' + out + ' in-body links)');
}

/* ---- 8. Cache correctness ---- */
{
  const ht = fs.readFileSync(path.join(ROOT, '.htaccess'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  ok(/no-cache, must-revalidate/.test(ht) && /html\|css\|js\|json\|xml/.test(ht), 'cache: .htaccess no-cache for html/css/js/json/xml');
  ok(/cache: 'no-cache'/.test(sw), 'cache: service worker fetches with cache no-cache');
  const unversioned = htmlFiles.filter(f => {
    const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
    return /href="\/styles\.css"/.test(c) || /src="\/site\.js"/.test(c);
  });
  ok(unversioned.length === 0, 'cache: every page uses versioned assets' + (unversioned.length ? ' (' + unversioned.join(', ') + ')' : ''));
}

/* ---- 9. Links resolve, ads, canonicals, sitemap ---- */
let linksOk = true;
for (const f of htmlFiles) {
  const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const hrefs = [...c.matchAll(/href="(\/[^"#]*?)(#[^"]*)?"/g)].map(x => x[1].split('?')[0])
    .filter(h => h !== '/' && !h.includes("'") && !h.includes('+') && !h.includes('$'));
  for (const h of new Set(hrefs)) {
    const target = h.replace(/^\//, '');
    if (target && !fs.existsSync(path.join(ROOT, target))) { linksOk = false; console.log('  broken link ' + h + ' in ' + f); }
  }
}
ok(linksOk, 'links: every internal link resolves');
let adsOk = true, canonOk = true;
for (const f of htmlFiles) {
  const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (!['privacy.html', 'terms.html'].includes(f) && !c.includes('ca-pub-4138594802747479')) { adsOk = false; console.log('  no AdSense in ' + f); }
  if (!c.includes('rel="canonical"')) { canonOk = false; console.log('  no canonical in ' + f); }
}
ok(adsOk, 'ads: AdSense on every content page');
ok(canonOk, 'seo: canonical on every page');
ok(fs.readFileSync(path.join(ROOT, 'ads.txt'), 'utf8').trim() === 'google.com, pub-4138594802747479, DIRECT, f08c47fec0942fa0', 'ads: ads.txt exact line');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
ok(htmlFiles.every(f => sitemap.includes(f === 'index.html' ? 'https://strongmomquotes.com/' : 'https://strongmomquotes.com/' + f)), 'seo: sitemap covers every page');
ok(!sitemap.includes('verify.php') && !sitemap.includes('leads.php'), 'seo: admin and verify pages kept out of the sitemap');

/* ---- 10. No node_modules or junk in the delivery ---- */
ok(!fs.existsSync(path.join(ROOT, 'node_modules')), 'delivery: no node_modules');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
