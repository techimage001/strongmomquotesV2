# Strong Mom Quotes: expansion to ~150 pages (July 2026)

## Totals
- **155 pages total**: 140 content pages + 6 hubs + A-Z directory + existing/legal pages.
- Corpus data layer: **626 original quotes**, tagged by audience, tone, life-stage, theme, length.

## What was added to reach 150
- Deeper life stages: grandma, stepmom, adoptive mom, twin mom, toddler mom,
  moms of teenagers, special-needs mom (careful, affirming, non-clinical), mom of boys/girls, proud mom.
- More affirmation need-states: boundaries, patience, morning, bedtime, exhausted,
  overwhelmed, confidence, grandma, stepmom, special-needs.
- More captions & occasions: grandma, mom-life, mother-daughter, mother-son, family,
  birthday for son/daughter, new baby, pregnancy announcement.
- More theme pages and formats (wall art, mugs, inspirational, two-word).
- The full Dads & Single Parents wing (23 pages) is retained.

## Quality gate (all passing)
- Worst similarity between any two pages: **0.45 Jaccard** (bar 0.72).
- Words: min 689, average 863.
- Every title and meta description unique sitewide.
- FAQ schema built FROM visible text (parity by construction).
- Zero orphans, every internal link resolves, breadcrumbs + gate + ads + card links on every page.
- Every quote original and unattributed (except the clearly-sourced public-domain Classic page).

## Architecture
- Hub-and-spoke: Home -> 6 hubs -> spokes, 2 clicks from home, reciprocal linking, A-Z directory.
- Sitemap: 155 URLs.
- Card maker stamps strongmomquotes.com on every downloaded card (Pinterest growth loop).

## Deploy
1. Upload all files, commit, deploy.
2. Resubmit sitemap.xml (155 URLs) in Search Console.
3. Hard-refresh (assets cache-busted to v=3).
4. Secrets stay in smq_private/secrets.php on the server.

## PREMIUM REDESIGN + FEATURES (this update)
- Complete visual redesign to a premium "soft & modern" system: layered shadows,
  soft ambient gradients, refined quote cards with gradient accent + hover lift,
  glassy sticky header, accordion FAQs with +/x toggle, dark gradient footer,
  gradient hero headline. All 140 content pages inherit it automatically.
- Card maker: added a CUSTOM COLOUR PICKER (any colour, with automatic light/dark
  text contrast so cards are never unreadable), plus FACEBOOK POST (1200x630) and
  LINKEDIN POST (1200x627) sizes alongside Instagram/Pinterest/Story.
- Unique favicon: an SMQ monogram with a gold quote mark in the plum brand palette
  (favicon.svg + PNG sizes + apple-touch-icon), wired into all 155 pages.

## On ads.txt "Not found" and sitemap "Couldn't fetch"
Both files are correct and live (verified). The statuses are because the site is
newly deployed and Google/AdSense have not finished their first crawl. They resolve
on their own once the site has been live and reachable for 24-48 hours. Re-submit
the sitemap in Search Console; ads.txt flips to Authorized after AdSense crawls it.
No file change was needed.
