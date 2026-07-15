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
