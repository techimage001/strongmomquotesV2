STRONG MOM QUOTES - V7  (strongmomquotes.com)
Card maker brought up to the same standard as the condolence app, plus the mobile
and favicon fixes. 167 pages. Assets bumped to v=7. ALL CONTENT UNCHANGED.

=====================================================================
1. CARD MAKER - now matches condolencecardmessages.com feature for feature
=====================================================================
- FREE PHOTO UPLOAD with framing controls: Fill / "Show whole photo" toggle, a
  zoom slider, drag-to-reposition on the card, and an orientation-aware frame so
  portrait photos never get heads cropped. Entirely in your browser; the photo is
  never uploaded.
- TEN QUICK DESIGN PRESETS (one tap sets background + font + frame + accent +
  text style): Classic cream, Bold statement, Soft blush, Sage calm, Golden hour,
  Midnight, Wreath floral, Deco elegant, Lily & ivory, Modern minimal.
- CORRECT EXPORT SIZES - Facebook fixed from 1200x630 (a link banner that
  letterboxed the card) to 1200x1200; LinkedIn fixed from 1200x627 to 1200x1200;
  NEW X post at 1600x900. Print sizes added: Card 5x7, A5, US Letter, all 300 DPI.
- TRUE FOLDED CARD PDF - a real 2-page A4 landscape PDF: outside sheet (back +
  your card front) and inside sheet (the quote set in clean type), with a dashed
  fold line and corner crop marks. It OPENS in your browser's PDF viewer on both
  desktop and mobile so you see it first, then save, print or share.
- MORE ACTIONS in one clean row: Share, Print, Folded card PDF, WhatsApp,
  Share on X, Copy quote, Save - plus the primary Download button.
- SAVE BUTTON STATE - outline heart + "Save" by default, filling to a solid heart
  + "Saved" only after you click it.
- THREE NEW ORIGINAL FRAMES - Deco corners, Wreath, Lily corner - plus a Feather
  accent. All code-drawn, copyright-safe. Verified: all 10 frames render
  distinctly.
- The card URL now clears the frame line on every aspect ratio.

Deliberately NOT carried over from the condolence app: paw prints, rainbow
bridge, dove and candle. Those are pet-loss and memorial motifs; they would look
wrong on a strong-mom card. Everything else is identical.

=====================================================================
2. MOBILE - rebuilt to match the condolence site
=====================================================================
The old header pushed a huge "Open the Card Maker" oval and a cut-off "Sign in"
across the screen. It now shows exactly what condolencecardmessages.com shows:
logo on the left, a compact Sign in, and a hamburger that opens a full-width
drawer with every link.
- Applied to ALL 167 pages - every page family (generated pages, hubs, tools,
  captions, affirmations, dads wing, static and legal pages), each loading the
  nav script. privacy.html and terms.html previously had no script at all.
- Verified identical header metrics to the condolence app (nav height 74px,
  44px hamburger, CTA hidden, drawer opens at 320/360/390/414px).
- ZERO horizontal drift at 320/360/390/414 across nine page types.
- The drift guard uses overflow-x:CLIP, not hidden - hidden creates a scroll
  container and silently disables the floating preview. Sticky preview verified
  working on desktop and mobile.

=====================================================================
3. FAVICON - Google compliant, now eligible in search
=====================================================================
- Complete set: favicon.svg, 48, 96, 192, 512, apple-touch-icon 180, and a NEW
  multi-size favicon.ico at root (16/32/48/64/128/256).
- All square; larger than Google's 48x48 minimum recommendation.
- Declared on ALL 167 pages (previously most pages declared only svg/32/48).
- Google reads the HOME page favicon, crawls it separately, and takes days to
  weeks to show it. After uploading, run URL Inspection > Request Indexing on the
  home page, then leave the favicon URL unchanged.

=====================================================================
4. PRIVACY / TERMS - checked, original, updated for the photo feature
=====================================================================
The privacy policy is original to this site and not copied from any other
website. It was updated for the new photo upload: it now states plainly that any
photo you add is read and drawn by your own browser and is never uploaded,
stored or seen by us. Terms gained one clause: you confirm you have the right to
use any photo you add, and photos are processed in-browser only.

=====================================================================
5. QUALITY CHECKS - nothing else was changed
=====================================================================
Every page was rebuilt from your original V6 file with ONLY the nav, favicon and
asset-version changes applied, so content could not drift.
- data/quotes.json byte-identical to V6 (16 categories, 236 quotes)
- 0 pages with a changed title, H1 or meta description (verified against V6)
- 0 broken links, 0 duplicate titles, 0 duplicate descriptions
- 0 condolence-brand leaks
- Card maker JS valid, no console errors
- All 7 action buttons present; folded PDF verified as a valid 353KB %PDF-

NOTE: tools/build.js has been updated with the new nav and favicon block so
future regenerations keep them. Be aware that data/quotes.json contains newer
metaTitles than the ~14 shipped generated pages, so running `node tools/build.js`
would change those titles. It was NOT run for this release, to keep your live
content exactly as it is.

DEPLOY: upload everything and hard-refresh once (v=7).
