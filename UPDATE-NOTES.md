# Strong Mom Quotes V5 (July 2026)

## Card maker: creative toolbox (NEW, all optional, off by default)
- FRAMES (pick independently of colour): Classic double keyline, Gold deco corner
  brackets, Soft arch mat, Botanical corner sprigs, Ribbon banner, Minimal inset.
- LITTLE ACCENT motifs: heart, star, sparkles, flower, leaf, sun, baby rattle.
- TEXT STYLE: clean, underline flourish, statement (uppercase), quote marks.
- All drawn in code (no external images) so they stay copyright-safe and print crisp.
  Spacing tuned so accents and quote marks never crowd the text or author line.

## Card downloads now carry metadata + a descriptive filename (NEW)
- Each downloaded/shared PNG embeds tEXt metadata: Title (the quote), Description,
  Author, Copyright, Source (https://strongmomquotes.com), Software.
- Filename is now e.g. strong-mom-quotes-his-safe-place-forever-square.png.
- Helps Google Images and provenance. NOTE: most social apps strip file metadata and
  set alt text themselves, so this is for image SEO/provenance, not the platform alt tag.

## SEO / metadata / internal linking (completed the paused audit)
- OG + Twitter + JSON-LD schema added to contact, app, privacy, terms.
- Visual breadcrumbs + 3-level BreadcrumbList schema added to the 3 original pages
  (encouraging-quotes-for-moms, mom-quotes-from-daughter, classic-mom-quotes); those
  3 are now listed in the Collections hub.
- all-quotes.html (the full A to Z index, linked from the homepage and the sitewide
  footer) now covers every page, including the 3 originals plus a Tools and extras
  section (card maker, tools, message writers).
- Sibling-collection link bands added to tools.html and generators.html.
- Removed stray em dashes from code comments, toasts and diagnostics.

## SMTP
- Unchanged. Authenticated SMTP stays scoped to strongmomquotes.com (no porting).

## Deploy checklist
- Ensure secrets.php has smtp_pass (info@ mailbox password).
- Upload the full package (includes /og/, /data/quotes.json, tools.js, generators.js,
  smtp_mailer.php, styles.css, site.js, sitemap.xml).
- Resubmit sitemap.xml in Search Console.

---

# Strong Mom Quotes: major feature build (July 2026)

## SMTP email fix (INCLUDED IN THIS BUILD)
- subscribe.php + verify.php now send via authenticated SMTP (smtp_mailer.php),
  not PHP mail(). Add 'smtp_pass' (the info@ mailbox password) to secrets.php.
- Fixes emails going out from the wrong identity / not sending.

## NEW: Find the Right Words (tools.html) — the "feel understood" entry point
- MOOD FINDER: pick how today feels (overwhelmed, mum guilt, exhausted, need a lift,
  proud, grateful, want a laugh, missing someone) and get quotes that match.
- INSTANT SEARCH across all 698 quotes (client-side, fast).
- RANDOM quote generator ("Surprise me").
- QUOTE OF THE DAY (same for everyone each day, a reason to return).
- Powered by quotes.json (698 original quotes, mood-tagged).

## NEW: Message Writers (generators.html) — long-tail SEO + real utility
- Letter to Mom, Thank You Mom, Baby Shower Message, Mother's Day Speech.
- Answer a few prompts, get a heartfelt ORIGINAL message (template engine,
  many variations, no AI cost, nothing stored). Copy, read aloud, or "try another version".

## NEW high-intent content pages (from the competitor/Reddit analysis, no duplication)
- Burnout Mom Quotes, Christian Mom Quotes, Stay-at-Home Mom Quotes,
  Missing My Mom Quotes, Birthday Quotes for Mom, Healing Mom Quotes,
  Morning Quotes for Moms, Good Night Mom Quotes, Mother's Love Quotes,
  Strong Mother Daughter Quotes.
- Corpus grown to 698 original quotes to fill them properly.

## Every quote page now has
- COPY button, READ ALOUD button (Web Speech API), and "Make a card".
- The card maker Share button + illustrations + colour picker + FB/LinkedIn sizes
  from previous updates remain.

## Sharing
- Per-page OG SHARE IMAGES (branded 1200x630) for home, tools, generators, the hubs,
  and top pages, so Pinterest/Facebook shares look rich instead of bare.
- "Check your inbox (and spam)" confirmation message improved after signup.

## Totals
- 167 pages total (150 content + tools + generators + hubs + directory + legal).
- QA 15/15: worst similarity 0.37, avg 901 words, unique titles/descriptions,
  FAQ parity, zero orphans, all links resolve.
- Sitemap: 167 URLs.

## Deploy
1. Add 'smtp_pass' to secrets.php (info@ mailbox password).
2. Upload everything (incl. /og/ folder, quotes.json, tools.js, generators.js,
   smtp_mailer.php). Commit, deploy, hard-refresh.
3. Resubmit sitemap.xml (167 URLs).
