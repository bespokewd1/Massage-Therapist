# Stone Massage dark-mode audit

> Historical pre-repair findings. Implementation and final verification are recorded in [dark-mode-repair-2026-10-22.md](dark-mode-repair-2026-10-22.md).

Date: 2026-10-22
Scope: supplied homepage light/dark screenshots and mobile-massage dark screenshot, current source, and 12 public routes in a local browser. This is an audit, not a repair. No application code, theme constants, or dependency manifests were changed.

## Implementation integrity verdict

**Fail for a consistent site-wide theme contract.** There are working local dark styles, but the site does not use one resolved theme or one foreground/background contract throughout. A blanket white-text fallback sits alongside unchanged light-mode variables, important Tailwind utilities, inline white panels, and higher-specificity component rules. Copied selectors target sections that no longer exist. The visible failures match the supplied screenshots.

This is a repairable theme/cascade problem. It does not require replacing the working light-mode design or the Stone Massage pink identity.

## Executive summary

**Audit health score: 8/20, Poor.** Scores describe this bounded implementation audit, not a Lighthouse score or WCAG certification.

| Dimension | Score | Main evidence |
| --- | --- | --- |
| Accessibility | 1/4 | Completely disappearing text, dark-on-dark FAQ/footer, incorrect toggle state, invisible focused skip link. |
| Performance | 2/4 | Successful static build and optimized image pipeline, but persistent effects and avoidable layout animation remain. No lab/field speed score measured. |
| Responsive design | 3/4 | Main layouts fit 1440px and 390px; contact cards also fit 320px. Theme failures reproduce on phones. Menu Escape behavior needs repair. |
| Theming | 1/4 | Two different activation mechanisms and incomplete token/foreground coverage. |
| Implementation integrity | 1/4 | Repeated stale selectors, duplicated theme setup, placeholder purchase links and unrelated template content. |
| **Total** | **8/20** | **Poor. Major shared-component repairs needed.** |

The register below contains **17 grouped findings: P0 0, P1 10, P2 7, P3 0**. Repeated DOM nodes on different pages are not counted as separate defects. P0 is reserved for a confirmed complete task blocker; the unused purchase links require a business decision, not an invented checkout.

Most important repairs:

1. Pair the white panels with a matching foreground or turn them into dark panels. Currently their copy becomes white on white.
2. Correct the heading/body tokens actually consumed by FAQ and review content. Stop depending on global white heading/paragraph rules.
3. Repair the footer's explicit black text, and the blog's black pagination arrows.
4. Align Tailwind dark variants with the site's selected theme and derive the toggle's ARIA state from that theme.
5. Give actions, open FAQ questions, and image-backed cards tested foreground/background pairs.

## What was checked

- Read all three supplied FireShot captures, including readable crops of the white panels, FAQ, services and footer.
- Reviewed main page code, both shared layouts, global CSS/LESS, navigation, footer, theme toggle, content components, React pagination and blog styles. The separate booking document was also reviewed.
- Initial browser batch: 12 routes at desktop light, desktop dark, and mobile dark. Desktop viewport 1440×1000; phone viewport 390×844.
- Final confirmation batch: the same 12 routes from the fresh production build at desktop dark and phone dark. Also checked contact at 320px, FAQ keyboard activation, theme toggle/restoration, Astro navigation, storage denial, reduced-motion preference, skip-link focus, and menu Escape behavior.
- All tested local routes returned HTTP 200 in the initial batch. `npm run build` passed and generated 33 pages.
- Ran axe-core WCAG A/AA checks and the bundled Impeccable source detector. Findings were checked against current source and browser behavior.
- Verified Tailwind v4's default OS-driven dark variant and selector override against current official documentation: <https://tailwindcss.com/docs/dark-mode>.

Assumptions: the checked-out implementation is the relevant source for the supplied captures, although the exact deployed commit was not compared. Light mode is the baseline to preserve, not a claim that it already passes accessibility.

Limits: not every blog post or pagination route received a browser visit. One article and the shared article template were checked; current Markdown was source-reviewed. Nested gallery client/events pages were source-reviewed; `/gallery/inside/` was browser-tested. CMS, dev previews and project-template routes were excluded from runtime coverage. No tablet, real-device, screen-reader, text-zoom or cross-browser certification was performed. No Lighthouse/Core Web Vitals measurement was taken. External booking-widget internals are outside parent-page CSS control.

## Route coverage

Counts are axe **contrast-failing nodes**, ordered **built desktop dark / built phone dark / initial desktop light**. They include repeated shared footer and action content. They are not unique issue counts. Image/gradient/translucency contrast can be marked incomplete, so a low count does not certify a page. The homepage's final count differs slightly after scrolling/decoding content during confirmation.

| Route | Contrast nodes D / M / light | Assessment |
| --- | --- | --- |
| `/` | 43 / 41 / 14 | White mobile-service panel hides copy; FAQ and review intro fail; service-card backdrop needs contrast control; shared footer fails. |
| `/mobile-massage/` | 39 / 37 / 10 | Both white information panels hide labels/copy; FAQ and shared footer fail. |
| `/direct-billing/` | 32 / 28 / 10 | Main insurance copy adapts; review intro and shared footer fail. |
| `/contact/` | 31 / 27 / 9 | Both booking-choice cards lose headings/descriptions; shared footer fails. Book Online points to a telephone link. |
| `/gallery/` | 30 / 26 / 7 | Local gallery tokens work; shared footer fails. Small count text needs separate contrast review. |
| `/giftcertificate/` | 3 / 4 / 9 | Most local sections adapt; review intro fails. No theme switch/header/footer; navigation script throws. Purchase links are placeholders. |
| `/about/` | 38 / 34 / 10 | Main content colors adapt; FAQ and footer fail. Existing unrelated business name/person and property photos remain. |
| `/booking/` | 6 / 2 / 6 | Shared header theme issues; cross-origin provider is not controlled by local CSS; iframe has no title. No footer by design in current markup. |
| `/reviews/` | 32 / 28 / 9 | Review intro and shared footer fail; testimonial body/author token changes correctly. |
| `/blog/` | 32 / 28 / 9 | Article cards/sidebar adapt; bare pagination arrows remain black and enabled icon links lack names; shared footer fails. |
| `/blog/hot-stone-massage-benefits-safety-and-who-its-best-for/` | 29 / 25 / 7 | Article body/sidebar adapt; shared footer and common header/action issues remain. |
| `/gallery/inside/` | 30 / 26 / 7 | Shared footer fails. Old property-photo template is not appropriate clinic imagery. |

The gallery and blog content areas show that scoped dark styles can work in this project. The recurring footer failure makes otherwise reasonable pages look broken. Gift certificate and booking have fewer failures partly because they omit that footer, not because they have complete theme coverage.

## Why dark mode breaks

1. `src/styles/dark.less:26-38` changes the canvas and sets plain headings, paragraphs and list items to white. It does not theme each containing panel.
2. `src/styles/root.less:22-23` defines `--headerColor: #1a1a1a` and `--bodyTextColor: #4e4b66`. Dark mode does not change either. Important FAQ/review utilities still use them.
3. `src/styles/global.css:1` imports Tailwind with `important`. Consequently `text-black` and token-based text utilities beat normal LESS declarations. Higher-specificity footer rules also beat the global element fallback. Adding more broad global color rules would not solve either case reliably.
4. The toggle changes `body.dark-mode`; Tailwind's `dark:` utilities still follow `prefers-color-scheme` because no custom dark variant is defined. Two different preferences can affect one page.
5. Legacy CSS targets `#services`, `#cs-footer`, or old component classes instead of current `.mobile`, `#footer`, and modern markup. In particular, `body.dark-mode #services` does not theme the new mobile information panels.

Normal scoped `body.dark-mode #section` LESS **does compile to matching selectors** here. It is not correct to blame Astro scoping for all dark styles. Likewise, theme persistence through Astro navigation worked in the browser; missing persistence is not the root cause.

## Verified contrast examples

| Content | Foreground / background | Contrast | Required |
| --- | --- | --- | --- |
| Home/mobile information copy; contact booking-card copy | `#fff` / `#fff` | **1.00:1** | 4.5:1 normal text |
| FAQ heading and closed question | `#1a1a1a` / `#12110f` | **1.08:1** | 3:1 large text |
| FAQ answer and review introduction | `#4e4b66` / `#12110f` | **2.26:1** | 4.5:1 |
| Footer links/list content with opacity compositing | approximately `#010203` / `#061623` | **1.13:1** | 4.5:1 |
| Open FAQ question | `#fafbfc` / `#f984ef` | **2.11:1** | 3:1 at desktop size; 4.5:1 for smaller text |
| Typical booking button | `#fff` / `#f3117e` | **4.04:1** | 4.5:1 at 16px bold |
| Near-white booking-button label | `#fafbfc` / `#f3117e` | **3.90:1** | 4.5:1 |

Normal 16px bold text is not large text under WCAG. The button contrast issue also exists in light mode. Preserve light mode during dark-only repairs, but track this existing baseline defect rather than calling it accessible.

## Detailed findings

### 1. P1: service-information and booking cards hide text completely

- **Location:** `src/pages/index.astro:288-344,1332-1339`; `src/pages/mobile-massage.astro:330-492,1179-1186`; `src/pages/contact.astro:35-74`; `src/styles/dark.less:29-37`.
- **Category:** Theming, accessibility.
- **Impact:** White backgrounds remain while headings and descriptions become white. Service options, service areas and booking-choice explanations disappear. Confirmed in supplied captures and both local device widths, including production output.
- **Standard:** WCAG 1.4.3.
- **Recommendation:** Give each panel a coordinated surface and foreground. For a dark panel, change the background and copy together. If a panel intentionally remains light, give it an explicit dark foreground. Replace contact's inline white surfaces with a component style. Do not globally turn every heading white.
- **Suggested command:** `$impeccable colorize`.

### 2. P1: FAQ and review introduction use unchanged light-mode text tokens

- **Location:** `src/styles/root.less:22-23`; `src/styles/dark.less:17-24`; `src/components/FAQ.astro:53,65,87`; `src/components/Review.astro:56`.
- **Category:** Theming, accessibility.
- **Impact:** FAQ titles, closed questions and answers are almost invisible on the dark canvas. The review introduction disappears on home, direct billing, reviews and gift certificates. Important utilities make the global white fallback ineffective.
- **Standard:** WCAG 1.4.3; invisible FAQ chevrons also affect 1.4.11.
- **Recommendation:** Change the consumed semantic heading/body tokens in dark mode, then give fixed-color/photo/action contexts their own foreground tokens. Preserve the working review-card `--bodyText` mapping at Review lines 77,82,84. Merely changing `--headerColor` everywhere can break blog buttons that also consume it.
- **Suggested command:** `$impeccable colorize`.

### 3. P1: footer keeps explicit black text on a dark background

- **Location:** `src/components/Footer.astro:35,270-296,327-350,471-477`.
- **Category:** Theming, accessibility.
- **Impact:** Navigation, services, contact links, section labels and credits become unreadable across most main routes. The dark rule changes only the background to `#061623`; ID-scoped black declarations and the important Follow Us `text-black` utility remain.
- **Standard:** WCAG 1.4.3.
- **Recommendation:** Set footer surface, primary text, secondary text, links and focus treatment as one component contract. Check logo legibility on the new background too. Do not invert every image or change the light footer as a side effect.
- **Suggested command:** `$impeccable colorize`.

### 4. P1: blog pagination arrows disappear and lack accessible names

- **Location:** `src/components/React/Pagination.tsx:63-86,168-191`; `src/components/React/ChevronRightIcon.tsx:8`; listing use at `src/pages/blog/[...page].astro:98-103`.
- **Category:** Theming, accessibility.
- **Impact:** Transparent enabled arrow controls use important `text-black`, and SVG stroke inherits currentColor. Their default dark-canvas pair is approximately 1.11:1. Axe also reports two unnamed enabled icon links on the first listing page.
- **Standard:** WCAG 1.4.11, 2.4.4 and 4.1.2.
- **Recommendation:** Use theme-aware foreground on transparent arrow buttons/links, supply names such as Next page and Last page, and check keyboard focus. Keep the filled pink page-number labels as a separate pairing.
- **Suggested command:** `$impeccable harden`.

### 5. P1: common actions and open FAQ state fail contrast in both themes

- **Location:** `src/styles/root.less:87-136`; `src/components/Header.astro:155-185,362-364,856-858,909-915`; `src/components/FAQ.astro:65`.
- **Category:** Accessibility, theming.
- **Impact:** Near-white text on the pink action and gradient, and near-white text on the pale open-FAQ header, miss text thresholds. The shared hover is white on `#ff66ad`, approximately 2.71:1. These are existing baseline defects, not introduced by dark mode.
- **Standard:** WCAG 1.4.3.
- **Recommendation:** Define on-action and on-selected foreground/background pairs, including hover/focus states. A dark foreground works on pale orchid. A darker action fill can support white text without changing the logo's brand color. Obtain approval before changing the established light appearance.
- **Suggested command:** `$impeccable colorize`.

### 6. P1: restored dark mode announces the opposite toggle state

- **Location:** `src/components/DarkModeToggle.astro:1,25-45`; `src/layouts/BaseLayout.astro:130-164`.
- **Category:** Accessibility, theming.
- **Impact:** `aria-pressed` starts false even when dark mode is restored. Clicking then makes the site light but pressed true. Browser checks reproduced this exact sequence. Navigation restores dark styling but recreates the same wrong button state.
- **Standard:** WCAG 4.1.2.
- **Recommendation:** Derive the attribute from resolved theme state on initialization, navigation and every click. Keep the native 48px button; do not toggle the old attribute independently.
- **Suggested command:** `$impeccable harden`.

### 7. P1: the skip link remains invisible when focused

- **Location:** `src/styles/root.less:298-305`; link at `src/layouts/BaseLayout.astro:109-112` and `src/layouts/SecondaryLayout.astro:65-68`.
- **Category:** Accessibility.
- **Impact:** Keyboard users focus an invisible control. Both built device-width checks show opacity 0 and z-index -1111111 while the link owns focus.
- **Standard:** WCAG 2.4.7.
- **Recommendation:** Reveal the existing link on focus-visible, above the fixed header, with a tested foreground/background pair in both themes. Preserve the working target `#main`.
- **Suggested command:** `$impeccable harden`.

### 8. P1: homepage heading keeps blinking under reduced motion

- **Location:** `src/pages/index.astro:290,2148-2151`.
- **Category:** Accessibility.
- **Impact:** The mobile-service headline continues to disappear once a second, indefinitely, even when reduced motion is requested. Browser computed style confirms the running blink animation. There is no pause control for this auto-starting blinking content.
- **Standard:** WCAG 2.2.2. This audit does not claim a seizure-threshold violation.
- **Recommendation:** Make this informational heading static, or provide a stop/pause path and a non-blinking reduced-motion presentation. Preserve its content and prominence.
- **Suggested command:** `$impeccable animate`.

### 9. P1: booking/purchase labels do not always lead to the stated action

- **Location:** `src/pages/contact.astro:63-70`; `src/pages/giftcertificate.astro:36-40,255-257,292`.
- **Category:** Implementation integrity.
- **Impact:** Contact's Book Online link points to `tel:587-938-0458`. Gift-certificate Buy actions point to `#`, while copy states secure PayPal payment. Visitors cannot complete the action those labels describe. These are existing product-flow problems, separate from dark mode.
- **Standard:** Link purpose and truthful interaction behavior; business confirmation is required for the purchase flow.
- **Recommendation:** Point clinic booking to the confirmed MassageBook destination. Do not invent or wire a gift checkout without a business decision; remove/clarify the unavailable purchase action and unsupported payment wording with approval.
- **Suggested command:** `$impeccable clarify` followed by `$impeccable harden`.

### 10. P1: extra contact buttons and the booking frame lack names

- **Location:** `src/pages/contact.astro:50-53,72-75`; `src/pages/booking.astro:59-63`.
- **Category:** Accessibility.
- **Impact:** Two empty contact-card buttons add unnamed keyboard/screen-reader stops. The embedded booking frame has no descriptive title. Axe reproduced button-name and frame-title violations in both themes.
- **Standard:** WCAG 4.1.2 and frame identification under 2.4.1.
- **Recommendation:** Remove the empty leftover buttons if they have no task, rather than labeling dead controls. Add a clear frame title and retain a direct provider booking link as an available alternative.
- **Suggested command:** `$impeccable harden`.

### 11. P2: Tailwind and LESS follow different theme switches

- **Location:** `src/styles/global.css:1-6`; `src/components/DarkModeToggle.astro:34-37`; `src/components/Header.astro:24-28,124,587-590,1015-1018`.
- **Category:** Theming.
- **Impact:** A manual dark choice changes LESS but leaves Tailwind in OS-light styling, or vice versa. The announcement colors and logo filters can disagree with the selected site theme. Header markup plus emitted production CSS confirms the OS media-query variant.
- **Standard:** Consistent resolved theme state; no separate WCAG claim for the mere mismatch.
- **Recommendation:** Use one activation selector for both systems. The smallest compatibility repair is to retain `body.dark-mode` and define Tailwind's custom dark variant against `.dark-mode`. If state moves to the HTML root, migrate all existing body selectors deliberately. Do not keep two independent flags.
- **Suggested command:** `$impeccable harden`.

### 12. P2: preference application writes storage and assumes storage works

- **Location:** `src/layouts/BaseLayout.astro:130-164`; `src/layouts/SecondaryLayout.astro:86-120`; `src/pages/booking.astro:70-104`; `src/components/DarkModeToggle.astro:37`.
- **Category:** Theming, implementation integrity.
- **Impact:** First visit saves the OS fallback as an explicit preference without a user choice. Later OS changes are ignored. Denied storage throws and leaves an OS-dark visitor in light appearance, confirmed in the browser. Native `color-scheme` stays normal and browser theme-color stays white during dark mode.
- **Standard:** Robust preference handling; browser-native control integration.
- **Recommendation:** Separate resolve, apply and user-save operations. Read storage safely; preserve an in-memory explicit choice if writing fails. Follow OS changes only when no explicit choice exists. Set native color-scheme from the resolved value. Share this small controller across the three documents instead of copying it. Early theme initialization is desirable, but no first-paint flash was reproduced in this audit.
- **Suggested command:** `$impeccable harden`.

### 13. P2: gift certificate inherits a theme without offering a switch

- **Location:** `src/pages/giftcertificate.astro:19`; `src/layouts/SecondaryLayout.astro:61-82,86-120`; `src/js/nav.js:7-19`.
- **Category:** Theming, implementation integrity.
- **Impact:** This page applies stored/system dark mode but omits the header/theme toggle. It also runs navigation setup without a menu; production browser checks record a null addEventListener error on that route.
- **Standard:** Consistent theme controls and matching script/layout responsibilities.
- **Recommendation:** Keep the intended standalone page layout if desired, but provide a small accessible theme control if automatic theme selection remains. Only initialize menu behavior when that menu exists. Do not force the full marketing header onto the page without a product decision.
- **Suggested command:** `$impeccable harden`.

### 14. P2: service cards have uncontrolled photo-dependent text contrast

- **Location:** `src/components/ServicesGrid.astro:47-64`; `src/pages/index.astro:350-367,2136-2145`; photo CTAs in `src/components/CTA.astro:12-42` and `src/components/CTAcopy.astro:65-105`.
- **Category:** Theming, accessibility verification.
- **Impact:** Important black card text sits over 40% pink/orchid and a variable photograph. Some cards cross dark stones and bright towels. Axe marks image-backed contrast incomplete, so no uniform numeric failure or pass is certified. Some white photo-CTA text also lacks a guaranteed active scrim.
- **Standard:** WCAG 1.4.3 requires manual verification against the actual composite.
- **Recommendation:** Establish a sufficiently opaque card surface or controlled local scrim, then test text and hover states at both widths. Do not merely switch all black card text to white; that would fail over light photo areas. Keep photography itself un-inverted.
- **Suggested command:** `$impeccable colorize`.

### 15. P2: persistent effects add avoidable rendering work

- **Location:** `src/pages/index.astro:1095-1101,2136-2145`; `src/pages/mobile-massage.astro:942-948`; `src/styles/root.less:111-128`; `src/components/FAQ.astro:84-87`.
- **Category:** Performance.
- **Impact:** Background-position will-change remains on at rest, desktop backgrounds use fixed attachment, and hover/accordion styles animate width or padding. These are code-level costs, not proof of a measured frame-rate failure. The detector's notices also include inactive code, which should not be treated as runtime defects.
- **Standard:** Prefer bounded effects and purposeful reduced-motion alternatives.
- **Recommendation:** Remove unnecessary persistent hints, scope effects to the actual active interaction, prefer transform for the button fill, and avoid animating padding when opacity/grid reveal suffices. Profile before larger performance changes.
- **Suggested command:** `$impeccable optimize`.

### 16. P2: old template content and selectors weaken implementation integrity

- **Location:** `src/pages/about.astro:57-88`; `src/pages/index.astro:443,615`; `src/components/Review.astro:56-59`; `src/pages/gallery/inside.astro`; stale mobile LESS documented in the companion notes.
- **Category:** Implementation integrity.
- **Impact:** About still names Healing Touch Massage Therapy and Sarah Thompson and shows property imagery. Homepage/review introductory copy also uses the old name. The nested clinic gallery is a property-photo template. Copy-pasted dark rules for missing sections make maintainers think coverage exists when it does not.
- **Standard:** Confirmed product identity in PRODUCT.md and truthful clinic presentation.
- **Recommendation:** Replace only confirmed template identity with Stone Massage/Cecilia Batu, remove irrelevant imagery/routes with approval, and remove obsolete selectors after checking active references. Keep the approved named testimonials untouched.
- **Suggested command:** `$impeccable clarify` and `$impeccable distill`.

### 17. P2: Escape does not close the current mobile menu

- **Location:** `src/js/nav.js:28-29,91-97`; `src/data/navData.json`.
- **Category:** Responsive interaction, accessibility usability.
- **Impact:** Escape registration lives inside the dropdown loop. Current nav data has no dropdowns, so the handler is never registered. Production mobile check opens the menu with aria-expanded true and Escape leaves it true. The close button still provides a workaround; a keyboard trap was not established.
- **Standard:** Expected dismiss behavior; no automatic WCAG failure asserted for Escape alone.
- **Recommendation:** Register menu-level dismiss behavior at menu setup, outside dropdown initialization, and synchronize expanded state when closing.
- **Suggested command:** `$impeccable harden`.

## Detector findings and false positives

The root detector run returned **122 entries: 33 warnings and 89 advisories**. These are not 122 verified defects. Keep `dark-mode-evidence/detector.json` as raw evidence.

- Fixed colors and off-system sizes support the observed system drift, but exact black/white values are legitimate for photographic or permanently light/dark contexts. They require local checking, not blanket replacement.
- Font popularity is not a dark-mode bug. Poppins is explicitly allowed for navigation in DESIGN.md prose, so related machine-readable palette/font warnings are not evidence to replace it. A Google Fonts import in Header is commented out.
- The gallery viewer's empty image source at `gallery.astro:128` belongs to a closed dialog and is populated by the viewer script. It is not proof of a visible broken-image box.
- Below-fold lazy images may have naturalWidth zero before scrolling. Those counts were not reported as broken assets. Final targeted captures decoded the relevant panel images.
- PromotionCard is imported but not actively rendered on these routes. Its latent concerns are excluded from active findings.
- Old dark `#services` rules do not apply to `.mobile`. The homepage #services rule does work on the Announcement panel. Not every old selector is inert.
- Gallery's small photo-count color and image/gradient contrast remain manual-review follow-ups rather than additional certified numeric defects.

## What works and should be preserved

- The warm near-black canvas, pink identity and existing light layout can be retained.
- Page-scoped dark rules for about, gift-certificate benefits/options/steps, blog cards/article/sidebar and gallery tokens do apply.
- Review card copy and author names already consume the correctly switched `--bodyText` variable.
- The native details/summary FAQ opens by keyboard at both tested widths. Fix its colors rather than rebuilding its behavior.
- The theme toggle is a native 48×48 button and survives navigation as a control. Fix its state synchronization rather than replacing it.
- Saved dark choice survives Astro client navigation.
- Responsive content fits the measured widths. Intentional clipped announcement text is not reported as document overflow.
- The header marquee already stops for reduced motion. The gallery also has reduced-motion handling.
- The static build and image optimization pipeline pass. No dependency or build failure explains the dark-mode defects.

## Recommended implementation plan

### First: establish one theme contract without changing the light design

1. Retain one resolved theme selector and bind LESS and Tailwind to it. For the current selector, Tailwind v4 supports:

   ```css
   @custom-variant dark (&:where(.dark-mode, .dark-mode *));
   ```

   This is a recommendation, not an applied change. It aligns the existing dark utility mechanism; it does not repair missing panel or text colors by itself.

2. Create or align semantic roles for page surface, panel surface, heading, body, muted text, border, action fill/on-action, and on-photo text. Preserve the current light values. Reuse existing tokens where the role is already clear; do not invent another parallel palette that components do not consume.
3. Apply/save theme through one controller. Update toggle ARIA from resolved state. Handle storage denial and OS preference changes, and reuse it in BaseLayout, SecondaryLayout and booking.
4. Treat `--bodyTextColorWhite` as a fixed on-dark/on-photo token, not as a generic theme-dependent body color. Give action labels their own pairing instead of reusing the page heading token.

### Second: repair shared components and page exceptions together

1. Correct the .mobile and contact panel surface/foreground pairs.
2. Correct FAQ, review introduction, footer, and transparent pagination arrows. Check selected, hover and focus states as part of the same batch.
3. Stabilize services/photo CTA backdrops. Preserve existing intentional photo and always-dark contexts.
4. Keep already-working local dark pairs. Delete stale dark rules only after mapping them to the active markup.
5. Address the separate baseline accessibility/booking issues with explicit light-mode approval where appearance or product copy must change.

Candidate dark-only pairs, **not applied or approved constants**:

| Role | Example | Contrast on page / panel |
| --- | --- | --- |
| Page / panel | `#12110f` / `#211c18` | Backgrounds, not text contrast claims |
| Heading/body | `#f5f1ed` | 16.79:1 / 15.02:1 |
| Muted text | `#cfc5bd` | 11.12:1 / 9.95:1 |
| Accent text on page | `#f984ef` | 8.60:1 |

For the existing pale selected surface, `#1a1a1a` on `#f984ef` is 7.94:1. If white labels must remain on filled actions, `#d20b68` provides 5.27:1 with white as one possible action-specific fill. Do not replace the global brand pink automatically. These are illustrative fixed-pair calculations, not a new committed palette.

### Third: bounded acceptance checks

- OS light + saved light; OS light + saved dark; OS dark + saved light; OS dark + saved dark.
- No saved preference, system changes while open, storage unavailable, reload and direct route entry.
- Theme and toggle ARIA stay consistent after repeated toggles, back/forward and Astro navigation.
- Homepage, mobile massage, direct billing, contact, gallery, gift certificates, booking, reviews, about, blog listing and representative article at desktop and phone widths. Keep light-mode regression captures beside dark captures.
- Expanded/collapsed FAQ, service/review hover, transparent pagination, menu open/close/focus, booking popup, footer and skip link.
- Normal text at least 4.5:1; large text at least 3:1; required graphical controls at least 3:1. Check actual photo composites manually.
- No unreadable white-on-white/dark-on-dark text, no unintended light panels in a dark page, no image inversion, no unguarded route errors.
- Reduced motion provides static/non-blinking alternatives without hiding information.
- Keep the cross-origin MassageBook widget readable. Use vendor-supported theming if available; do not apply CSS inversion to the iframe. A deliberate light booking area is acceptable if the parent page remains coherent.

## Recommended commands

1. **P1: `$impeccable harden`** for resolved theme state, ARIA, storage, accessible names, skip link and navigation behavior. Resolve the action destinations with confirmed business facts.
2. **P1: `$impeccable colorize`** for the complete dark surface/foreground pass across shared components and active page sections. Keep light visuals stable unless the baseline contrast repair is approved.
3. **P1: `$impeccable animate`** to remove the homepage blink and preserve reduced-motion access.
4. **P1/P2: `$impeccable clarify` and `$impeccable distill`** for the misleading booking/purchase labels, confirmed template remnants and obsolete styling.
5. **P2: `$impeccable optimize`** for persistent effects and layout animation, after the readable theme is in place.
6. **`$impeccable audit`** for the bounded theme/device regression checks above.
7. **`$impeccable polish`** as the final step after functional and contrast defects are fixed.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `$impeccable audit` after fixes to see your score improve.

## Evidence

- `dark-mode-architecture-notes.md`: theme/cascade/lifecycle source notes.
- `dark-mode-pages-notes.md`: page/component coverage and active/stale selector map.
- `dark-mode-evidence/runtime-results.json`: first browser batch and axe details.
- `dark-mode-evidence/built-confirmation.json`: production output confirmation and targeted interaction results.
- `dark-mode-evidence/theme-tests.json`: system fallback, ARIA, navigation and denied-storage sequence.
- `dark-mode-evidence/detector.json`: unfiltered root source-detector findings.
- `dark-mode-evidence/audit-provenance.json`: commands, assumptions and limits.
- `dark-mode-evidence/*built*.png`, review boards and supplied screenshot crops: visual evidence. Fixed headers/sticky actions can overlap a region screenshot because it captures the live page, not an isolated component render.

The original supplied images remain at their original paths. The audit created reports and evidence only. No application source or color constants were changed.
