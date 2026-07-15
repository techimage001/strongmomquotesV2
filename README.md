# Strong Mom Quotes (strongmomquotes.com)

Free mom quotes and affirmations site with a free quote card maker. Static HTML, CSS and vanilla JS, plus PHP for the email collector. Built to the V3 template.

## What is in the box

- `index.html`: SEO homepage. All Free Features comparison table, keyword prose with contextual links, 12 question FAQ with word for word schema parity.
- 16 generated content pages: 12 quote categories and 4 affirmation pages (moms, single mom, new mom, working mom). 246 quotes: original to this site, or verified public domain with the real source named.
- `app.html`: the card maker PWA. Canvas cards (8 backgrounds, 3 font styles, Pinterest, Instagram and story sizes), favorites, daily quote, write your own, JSON backup and restore, offline after first load.
- `subscribe.php`, `verify.php`, `leads.php`, `config.php`: the collector. Seven anti-bot layers ending in email verification. Config holds NO secrets.
- `contact.html` (info@strongmomquotes.com), `privacy.html`, `terms.html`.
- `ads.txt`, `robots.txt`, `sitemap.xml`, `.htaccess`, `manifest.json`, `sw.js`, icons.
- `data/quotes.json` and `tools/build.js`: the content database and the page generator.
- `tools/tests.js` (53 checks) and `tools/acct.test.js` (26 JSDOM checks).

## The three things that must be true before launch

### 1. The secrets file (do this FIRST)
The repo contains no password and no salt, by design: git history is permanent, so a secret committed once is recoverable even after a repo is made private. Create the secrets file by hand on the server, outside `public_html`. Full walkthrough: **SECRETS-SETUP.md**. Template: **SECRETS-TEMPLATE.php**.

If the file is missing, the site fails SAFE: the public pages and card maker keep working, and the admin panel refuses every login rather than falling open. This was tested, not assumed.

### 2. The mailbox
Create `info@strongmomquotes.com` in hPanel (Emails), forward it to Gmail if you like. It receives the contact form address, privacy requests and a notification for every VERIFIED signup, which doubles as an offsite backup of the list.

### 3. The webhook
Without it nothing auto-deploys, and "why is the site old" is almost always a missing webhook or an unclicked Deploy button.

## Deploy sequence

1. Create the secrets file on the server (SECRETS-SETUP.md).
2. Create the info@ mailbox in hPanel.
3. Push to GitHub. The repo can now be public without leaking anything, but private is still recommended.
4. hPanel, Advanced, GIT: connect the repo, add the deploy key to GitHub, click Deploy once.
5. GitHub, repo Settings, Webhooks: paste the Hostinger webhook URL, content type application/json, push event.
6. AdSense: swap every `data-ad-slot="0000000000"` for a real slot ID. They live in `index.html`, `app.html` and the `AD_SLOT` constant in `tools/build.js`. Set up the GDPR consent message in AdSense, Privacy and messaging.
7. Search Console: add the property, submit `https://strongmomquotes.com/sitemap.xml`.

## Verify on the live site

- `/ads.txt` returns the exact pub line.
- Download 3 cards, confirm the gate appears on the 4th.
- Sign up with a real email: you should get a confirmation email, and `leads.php` should show the address as PENDING. Nothing counts as a lead yet.
- Click the link in the email: `verify.php` says "You are all set", the card maker unlocks, `leads.php` flips the row to VERIFIED, and info@ receives the notification.
- The avatar with your initial appears in the header. Click it: your email, "Every tool unlocked, free.", and Sign out.
- Sign out, then tap Sign in and enter the same email: the device unlocks again with no free uses spent.
- Open a category page on a phone and check the contextual "If you like" and "Popular collections" blocks.

## Release checklist (every time)

1. Edit `data/quotes.json` to add or change content.
2. Bump `ASSET_V` in `tools/build.js` (currently `2`) and the matching `?v=` in `index.html`, `app.html`, `contact.html`, `privacy.html`, `terms.html`, `verify.php` and the `CORE` list in `sw.js`. Version queries plus the no-cache `.htaccess` plus the service worker's `cache:"no-cache"` are what stop a stale deploy.
3. `node tools/build.js`
4. `node tools/tests.js` and confirm 53 passed, 0 failed.
5. `php -l subscribe.php && php -l verify.php && php -l leads.php && php -l config.php`
6. Commit, push. The webhook deploys.

Never include `config.php` edits in a routine push if you have changed anything about it locally, and never create a `node_modules` folder inside this repo: a stray `node_modules` silently breaks GitHub's drag and drop upload. The JSDOM test lives outside the repo and is copied in for reference only.

## Anti-bot design, in one paragraph

Seven layers, in order: a honeypot field (bots get a fake success and nothing is stored), a three second time trap, a JS computed SHA-256 token signed with the per-site salt (plain curl fails here), an IP hash rate limit of three per hour, validation covering format, MX record, a disposable domain blocklist and dedupe, and finally the wall: a one click confirmation link with a 32 character token and a 48 hour expiry. Nothing counts as a lead and nothing unlocks until that link is clicked, because a bot cannot click a link in an inbox it does not own. On a server error the tool fails open so the user is never punished, but nothing is ever auto verified. There is deliberately no CAPTCHA and no Turnstile: invisible bot checks add a third party to a privacy policy and two more keys to leak, and email verification already guarantees the list is human.

## Content rules baked in

- Quotes are original to Strong Mom Quotes, or verified public domain with the real source named. Never add lines attributed to modern authors or celebrities, and never copy collections from other sites or apps.
- Pricing wording is "currently free" or "free for now". Never "forever", never "permanent". The test suite fails the build if those words appear.
- No em dashes. No competitor names. No fabricated statistics, ratings or testimonials. The app name is the only brand: no owner name, company or location anywhere.
- The site uses US English (mom, favorites) deliberately: "mom quotes" is the search market and the domain itself says mom.
