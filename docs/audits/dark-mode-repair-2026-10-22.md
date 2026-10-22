# Stone Massage dark-mode repair and verification

Date: 2026-10-22

## Result

The approved dark-mode repairs are implemented locally. The final production build passed. All 52 tested combinations, 13 public routes at desktop/phone widths in light/dark, returned HTTP 200. No axe WCAG A/AA violations, duplicate IDs, document horizontal overflow, or page-script errors were detected in that final batch. These results are not a WCAG certification or a live booking transaction test.

The light-mode layout, photography, Open Sans/Poppins typography, logo and brand pink remain. Shared action fills are darker for readable white labels. No dependencies were added to this project, no commits were made, and nothing was deployed.

## Implementation integrity verdict

Pass for the repaired theme and interaction contract. Tailwind and LESS now share `body.dark-mode`. A single small controller resolves theme state for all three document layouts. Panels, text and actions consume paired roles instead of a blanket white-text override. The named customer testimonials remain unchanged.

The full content audit remains incomplete until the owner supplies approved clinic photography, current gift-certificate artwork/terms, and real social destinations. Those are not reasons to invent assets, purchase flows or policies.

## Updated audit health score

This score uses the same bounded code-audit rubric as the original 8/20 report. It is not a Lighthouse score.

| Dimension | Before | After | Evidence and limit |
| --- | ---: | ---: | --- |
| Accessibility | 1/4 | 3/4 | Disappearing text, names, toggle state, skip focus and dismiss interactions repaired. Automated checks clean; image/gradient contrast still needs human judgment, and screen-reader/cross-browser certification was not done. |
| Performance | 2/4 | 3/4 | Removed persistent hints, blink and confirmed unused CSS; per-route emitted CSS is smaller. No Core Web Vitals or frame-rate measurement. |
| Responsive design | 3/4 | 3/4 | 1440px and 390px fit with working phone menu and dialog focus return. Not a full tablet, zoom or touch-target audit. |
| Theming | 1/4 | 3/4 | Shared selector, paired tokens and resolved state work in both themes. Incumbent fixed photo contexts and some local color values remain deliberately scoped. |
| Implementation integrity | 1/4 | 2/4 | Duplicate setup/popups and confirmed identity remnants repaired. Existing property photos, gift art and social placeholders remain owner decisions. |
| **Total** | **8/20** | **14/20, Good** | Remaining content decisions limit the overall score. |

No unresolved verified regression remains from the independent code review. There are three retained P2 content/business findings below. A provider-frame restriction in the local environment is recorded separately.

## Work grouped in parallel

- Harden: shared theme resolution, early initialization, toggle state, denied storage, OS changes, Astro swaps, native booking dialog and guarded navigation.
- Colorize: paired panel/text/action roles across header, footer, FAQ, reviews, service cards, mobile panels, contact and pagination.
- Animate and optimize: remove the blinking information heading, persistent background hints and unused copied CSS; preserve static reduced-motion backgrounds and use transform for the shared action fill.
- Clarify and distill: correct confirmed Stone Massage/Cecilia Batu identity, online clinic destination and misleading gift-purchase labels without inventing checkout.
- Audit and polish: one combined first inspection, one fixes batch, and the completed final confirmation described below. No further visual redesign or open-ended polish loop.

## Palette and behavior contract

Unchanged brand constants: `--primary: #f3117e`, `--secondary: #f984ef`, and the fixed photo/on-dark text `--bodyTextColorWhite: #fafbfc`.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#ffffff` | `#12110f` |
| Surface | `#ffffff` | `#211c18` |
| Raised surface | `#fff7fb` | `#302720` |
| Heading | `#1a1a1a` | `#f5f1ed` |
| Body | `#4e4b66` | `#cfc5bd` |
| Strong body | `#353535` | `#e8dfd7` |
| Border | `#d8cbd2` | `#806c60` |
| Link/accent | `#b80d64` | `#f984ef` |
| Focus | `#8d0846` | `#f984ef` |
| Service surface/text | `#f9d8ee` / `#1a1a1a` | `#30232b` / `#f5f1ed` |
| Review surface/text | `#fbd0e5` / `#1a1a1a` | `#4b2036` / `#f5f1ed` |

Actions use `#d20b68`, hover `#ae0955`, and white labels in both themes. The pale selected FAQ question uses dark `#1a1a1a` text. These are approved accessibility changes to existing light-mode pairs, not a replacement of the logo/brand palette.

Calculated opaque-pair contrast examples:

| Pair | Ratio |
| --- | ---: |
| White action label / action fill | 5.27:1 |
| White action label / hover fill | 7.07:1 |
| Dark body / surface | 9.95:1 |
| Dark heading / page | 16.79:1 |
| Open FAQ text / orchid | 7.94:1 |
| Light service text / surface | 13.33:1 |
| Dark service text / surface | 13.34:1 |
| Dark review text / surface | 11.99:1 |

These calculations do not certify text over variable photos or gradients. Actual panels, fixed-photo contexts and both theme captures were also visually reviewed.

## Original finding disposition

| Audit finding | Disposition |
| --- | --- |
| 1. White information/contact panels hide copy | Fixed with paired semantic surfaces and text. |
| 2. FAQ/review heading and body tokens unchanged | Fixed consumed tokens; removed broad white-element fallback. |
| 3. Footer black-on-dark text | Fixed local footer roles; original logo has a light backing within its image bounds. |
| 4. Invisible/unnamed pagination arrows | Theme-aware foregrounds, names, focus and disabled-link semantics. |
| 5. Shared actions/open FAQ contrast | Fixed action and selected-state pairs in both themes. |
| 6. Toggle ARIA disagrees with theme | Derived from resolved theme on init, changes and swaps. |
| 7. Invisible focused skip link | Focus reveals it above the header in both themes. |
| 8. Blinking heading under reduced motion | Removed blink. Information remains static. |
| 9. Booking/purchase labels mislead | Clinic links to confirmed MassageBook; gift actions now phone inquiries. Checkout is not claimed or implemented. |
| 10. Empty buttons/untitled frame | Empty controls removed; iframe title and direct booking alternative supplied. |
| 11. Tailwind and LESS use different activation | Both use `.dark-mode`. |
| 12. Storage/OS/native scheme handling | Shared safe controller; OS follows only without explicit selection; native scheme and theme-color synchronized. |
| 13. Standalone gift page has no switch/null menu error | Small standalone toggle added; nav handlers tolerate absent menu. |
| 14. Photo-dependent service/CTA copy | Opaque service/review pairs and controlled CTA scrims; photography not inverted. |
| 15. Persistent effects/copied styling | Main blink/hints/dead CSS removed. Two small existing local width transitions remain, not a measured runtime defect. |
| 16. Template identity/photos/selectors | Confirmed names and dead styles repaired. Property imagery remains pending owner assets. |
| 17. Mobile menu ignores Escape | Fixed one menu-level handler, including precedence for open native dialogs. |

## Verification

### Production and native checks

- `npm run build`: passed, 33 static pages reported by Astro.
- `node --test scripts/theme.test.mjs`: 7 passed.
- `npm run test:seo`: 6 passed.
- `npm run check:seo`: passed, 34 HTML routes including the redirect document, 11 articles and 20 PNG cards, no editorial warnings.
- `git diff --check`: passed.
- Astro syntax transforms and LESS compilation passed during implementation.
- Existing build notices remain for outdated Browserslist data and reprocessing already optimized WebP assets. They are not build failures.

### Browser coverage

Production preview at `127.0.0.1:4322`, Chromium, 1440x1000 desktop and 390x844 phone. Light and dark saved choices were tested with OS light to catch selector disagreement. Reduced motion was enabled in the route batch. A separate theme sequence exercised both OS choices.

Routes: `/`, `/mobile-massage/`, `/direct-billing/`, `/contact/`, `/gallery/`, `/giftcertificate/`, `/about/`, `/booking/`, `/reviews/`, `/blog/`, `/blog/2/`, `/blog/hot-stone-massage-benefits-safety-and-who-its-best-for/`, and `/gallery/inside/`.

Final results:

- 52/52 HTTP 200 responses for local documents.
- No detected axe WCAG A/AA violations in route snapshots or the open booking dialog.
- No duplicate IDs, horizontal document overflow, visible completed broken images or page-script errors in captured observations.
- FAQ keyboard activation and visible focused skip link work in all four modes.
- Dialog Escape and Close both close and restore focus to the opener in all four modes. Phone-menu Escape closes and restores focus to its toggle.
- Saved light/dark override either OS preference. Without a saved choice, system changes update the page without saving an explicit preference.
- Toggle pressed state, native color-scheme and theme-color remain consistent across Astro navigation, back/forward, standalone entry and denied storage.
- Reduced-motion hero/information/service backgrounds use scroll attachment and no persistent will-change hint. The original blink is absent from source.
- The native dialog was sampled with Tab. One step per cycle leaves `document.activeElement` outside the dialog before returning. Browser-chrome focus is not distinguished in this probe, so it does not establish a full keyboard-containment certification. No custom focus trap was added to replace browser behavior.

Axe still marks many photo/gradient-backed contrast checks incomplete. Zero reported violations is not proof every pixel pair meets WCAG. Region captures were reviewed manually; no real-device, screen-reader, non-Chromium, zoom or all-article certification was performed. External provider content is excluded from parent-document checks.

### Bounded fixes batch

The first combined inspection found invalid names on bare disabled pagination spans, the short footer-logo backing, and mobile-menu Escape interference with the native dialog. Independent source review also found the matching dialog-Close click/focus path. All were repaired in the same fixes batch.

The first inspection paused on a hidden lazy-image decode in the capture script. Its desktop portion resumed after forcing region images to load. A launched confirmation was stopped before inspection to include the late source-review click finding. The completed confirmation uses the final rebuilt output. No later visual edit or extra polish pass followed it.

### CSS size result

Uncompressed bytes of the unique local linked stylesheets for each built route, compared with the pre-repair output. These are stylesheet-byte comparisons, not network transfer timing or Core Web Vitals.

| Route | Before | Final | Reduction |
| --- | ---: | ---: | ---: |
| `/` | 112,992 | 101,452 | 10.2% |
| `/mobile-massage/` | 117,811 | 81,636 | 30.7% |
| `/contact/` | 83,300 | 78,902 | 5.3% |
| `/giftcertificate/` | 69,791 | 66,094 | 5.3% |
| `/blog/` | 87,568 | 82,221 | 6.1% |

### Source detector

Final detector output has 93 entries, 27 warnings and 66 advisories, down from 122 in the audit. Exit 2 is the detector's finding status, not an application build failure. Raw output is retained.

Twenty-four warnings concern incumbent font choices or font-system parsing. Open Sans/Poppins are intentionally preserved. One empty gallery-viewer image belongs to the closed viewer and receives its source when opened. Two warnings identify small existing local width transitions in contact/gift styles. None is evidence that the repaired dark theme is broken. Fixed photo colors, shadows and old type steps also produce advisories; they are not 66 verified defects.

## Remaining owner decisions

### P2. Gift-certificate artwork still contains old pricing/terms

- Location: `src/pages/giftcertificate.astro` and existing `public/assets/images/100gc.png`, `200gc.png`.
- Impact: retained artwork can disagree with current prices or validity rules. Nearby copy now identifies it as reference artwork and asks visitors to confirm details by phone.
- Needed: approved current artwork, pricing, terms and purchase method. No invented expiry policy or payment workflow was added.

### P2. Property/template photography remains

- Location: About, nested gallery pages and `CTAcopy.astro`.
- Impact: unrelated imagery can misrepresent the clinic even though it now renders coherently in both themes.
- Needed: approved clinic images, or approval to remove the affected content/routes. No public route or photo was silently replaced.

### P2. Footer social destinations remain placeholders

- Location: `src/components/Footer.astro`, existing `href="#"` social links.
- Impact: social controls do not reach real profiles.
- Needed: confirmed profile URLs or approval to remove the links. None was guessed.

### Local provider-frame limit

The embedded MassageBook document displayed a provider 403 response in the local preview. This is outside parent CSS and is not a confirmed production outage. The direct MassageBook alternative remains visible above the titled iframe. Verify the provider's allowed embed/origin configuration on the deployed hostname. Do not invert or fake the vendor content. No live appointment or payment was made.

## Assumptions and limits

The checked-out site is the intended implementation, and the existing light layout is the baseline to preserve. PRODUCT.md supplies confirmed business identity and destinations; named testimonials remain approved content. This repair does not validate medical claims, old certificate terms, all CMS content or a booking transaction. No dependency manifest, generated image policy or production deployment was changed.

## Evidence and files

- `dark-mode-repair-decisions.md`: approved scope and constants.
- `dark-mode-code-review-2026-10-22.md`: independent review and resolved findings.
- `dark-mode-*-implementation-2026-10-22.md`: per-owner implementation notes.
- `dark-mode-repair-evidence/confirmation/confirmation.json`: final route, theme, axe and interaction observations.
- `dark-mode-repair-evidence/acceptance-checks.json`: 50 explicit checks derived from those observations, all passed.
- `dark-mode-repair-evidence/confirmation/*.png`, `review-board-*.jpg`: final light/dark device captures.
- `dark-mode-repair-evidence/first-pass.json`, `first-pass-summary.json`: first inspection and fixes.
- `dark-mode-repair-evidence/asset-baseline.json`, `asset-final.json`, `asset-comparison-final.json`: stylesheet-byte evidence.
- `dark-mode-repair-evidence/detector-final.json`: raw source findings.
- `dark-mode-repair-evidence/*-final.log`: production build, tests and SEO command output.

Main application changes are in shared theme/navigation code, layouts, semantic styles, header/footer/FAQ/reviews/service/CTA components, pagination and the affected public pages. New source files are `src/js/theme.js` and `src/components/ThemeInit.astro`; native regression coverage is in `scripts/theme.test.mjs`.
