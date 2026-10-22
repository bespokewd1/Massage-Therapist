# Dark-mode page and content-component notes

Date: 2026-10-22

This is a read-only audit of page content and shared content components. No application code or color constants were changed. Theme initialization, toggle behavior, navigation, and shared footer findings belong to the main audit.

## Method and limits

- Reviewed the current source for the homepage, mobile massage, about, contact, direct billing, gallery, gift certificate, booking, reviews, blog listing, blog article, and nested gallery pages.
- Traced component uses and stripped HTML comments before deciding whether legacy markup is live. Imported components are not necessarily rendered.
- Read the incumbent tokens in `src/styles/root.less` and `src/styles/dark.less` and inspected the existing generated CSS. In that build, page `body.dark-mode` selectors compile to `body.dark-mode #section[data-astro-cid-...]`, without a scope attribute on `body`. They do match. A blanket claim that all scoped dark LESS is inert would be false.
- Reviewed the main audit's saved screenshots for the homepage white mobile panel, FAQ, and image-backed service cards. Runtime checks reported by the main agent confirm the white panel and contact card failures at desktop and mobile widths. `docs/audits/dark-mode-evidence/runtime-results.json` is the runtime source of truth.
- Ratios below use WCAG relative luminance for fixed color pairs. Ratios for photo-backed translucent cards are not certified. The service-card screenshot shows why a single assumed background value is unsafe.
- The relevant cascade facts are `src/styles/global.css:1`, which makes generated Tailwind utilities important, `src/styles/root.less:22-25`, which sets dark heading/body variables for light mode, and `src/styles/dark.less:17-24`, which changes only `--bodyText` and `--clr-primary`. The broad white rule at `src/styles/dark.less:26-37` cannot override important text utilities.

## High-priority page findings

### 1. P1, white mobile-information panels keep white text in dark mode

Affected routes: `/` and `/mobile-massage/`.

Evidence:

- The homepage's active mobile service section begins at `src/pages/index.astro:288`. Its ordinary paragraphs are at lines 291 and 328, service labels at 304, 315, and 325, and service-area label at 333.
- The homepage `.mobile` rule fixes the panel to `background: #fff` at `src/pages/index.astro:1332-1339`.
- The mobile route renders two active `.mobile` sections at `src/pages/mobile-massage.astro:330` and `:414`. Their panels stay white because `.mobile` sets `background: #fff` at `:1179-1186`.
- The mobile route's unqualified headings include “Add On Options” at `:374`, the add-on labels at `:386`, `:396`, `:406`, and the “Now Serving” label and service area at `:488-491`.
- `src/styles/dark.less:29-37` makes these `p`, `h1`, and `h2` elements white. The intended dark background rule targets `#services`, not `.mobile`, at `src/pages/index.astro:1466-1468` and `src/pages/mobile-massage.astro:1313-1315`.

Impact: substantial service information disappears. The main audit confirmed exact white-on-white, 1:1, on both device widths. The pink heading can remain visible, which makes the large empty area look like missing content rather than a deliberate light card.

Recommendation: theme the panel and its text as a pair. A dark `.mobile` surface with light copy is consistent with the existing site. A deliberately light panel is also possible, but all copy in it must retain an explicit dark foreground. Do not rely on the broad global `p` and heading rule.

Standard: WCAG 1.4.3.

### 2. P1, contact booking cards are white on white

Affected route: `/contact/`.

Evidence:

- Inline `background: white` appears on the two active card containers at `src/pages/contact.astro:35` and `:57`.
- Their headings and descriptions are ordinary `h1` and `h2` elements at `:41-42` and `:63-64`, with no explicit card foreground.
- The page's dark block at `src/pages/contact.astro:472-505` handles `.cs-title`, `.cs-text`, `.cs-topper`, old form fields, and the contact photo, but never these card containers.
- The global rule at `src/styles/dark.less:29-37` therefore makes the card copy white while the inline white backgrounds remain.

Impact: the mobile and in-clinic booking choices lose the text that explains them. The main audit confirmed the white-on-white state at desktop and mobile widths. The CTA buttons remaining visible does not repair the missing descriptions.

Recommendation: replace the inline-only surface with a themed booking-card style and explicit paired foreground. Preserve the separate always-photo-backed contact details panel.

Standard: WCAG 1.4.3.

### 3. P1, FAQ important text utilities retain light-mode dark colors

Affected routes: `/`, `/mobile-massage/`, `/about/`.

Evidence:

- The live component ID is `faq-1741` at `src/components/FAQ.astro:36-38`.
- The heading uses `text-[var(--headerColor)]` at `src/components/FAQ.astro:53`.
- Closed questions use the same dark color at `:65`; their chevrons inherit `currentColor` at `:70`.
- Answers use `text-[var(--bodyTextColor)]` at `:87`.
- `--headerColor` is `#1a1a1a` and `--bodyTextColor` is `#4e4b66`, set at `src/styles/root.less:22-23`; neither changes in `src/styles/dark.less:17-24`.
- Tailwind color utilities are important because of `src/styles/global.css:1`. The broad white headings/paragraphs in `dark.less` do not win. `summary` is not in that broad rule anyway.
- Open questions use `group-open:bg-[var(--secondary)]` and `group-open:text-[var(--bodyTextColorWhite)]` at `src/components/FAQ.astro:65`. That produces near-white on `#f984ef`, approximately 2.12:1. This open-state contrast problem also exists in light mode.

Impact: the main audit measured the heading at about 1.08:1 and the answer at about 2.26:1 against the dark canvas. Closed questions are similarly unreadable. The open question being visible does not mean the FAQ is themed correctly.

Recommendation: define foreground tokens that actually change under `body.dark-mode` or use explicit component dark styles compatible with the project's current body selector. Also choose an open-question foreground/background pair that meets the text threshold in both themes.

Standard: WCAG 1.4.3. The invisible chevron also affects non-text control visibility under 1.4.11.

### 4. P1, review introduction uses the unchanged muted-body variable

Affected routes: `/`, `/direct-billing/`, `/reviews/`, `/giftcertificate/`.

Evidence:

- `src/components/Review.astro:56` applies `text-(--bodyTextColor)` to the paragraph below the review heading.
- That variable remains `#4e4b66` in dark mode, while the section has no opaque light surface at `src/components/Review.astro:45`.
- The active component is mounted at `src/pages/index.astro:496`, `src/pages/direct-billing.astro:89`, `src/pages/reviews.astro:26`, and `src/pages/giftcertificate.astro:278`.
- Review body text and author/role text use the separate `--bodyText` variable at `src/components/Review.astro:77`, `:82`, and `:84`. Unlike `--bodyTextColor`, that variable does change to `#fafbfc` at `src/styles/dark.less:22`.

Impact: the review heading and cards can look themed while the explanatory paragraph is dark on the dark canvas, approximately 2.27:1 against `#12110f`.

Recommendation: use the same semantic dark-mode body foreground contract for this introduction as for the surrounding content. Preserve the existing card light text and its coordinated dark-on-lighter-pink hover state. The `group-hover:text-black` declarations are not automatically defects because their hover background also changes at `src/components/Review.astro:70`.

Standard: WCAG 1.4.3.

### 5. P1, blog pagination's bare arrows remain black

Affected route: `/blog/` and its paginated listing routes.

Evidence:

- The listing mounts `Pagination` at `src/pages/blog/[...page].astro:98-103`.
- First, previous, next, and last arrow anchors have transparent default backgrounds and `text-black` at `src/components/React/Pagination.tsx:65`, `:80`, `:170`, and `:186`.
- The chevron SVG components set `stroke="currentColor"`; for example, `src/components/React/ChevronRightIcon.tsx:8`.
- The text utilities are important, so inherited white from a `li` in dark mode does not reach the arrow stroke.

Impact: enabled pagination arrows are black on the dark page, approximately 1.11:1 against `#12110f`, until hover. This is a code-confirmed fixed pair. Disabled arrows also have reduced opacity, but enabled navigation is the relevant failure.

Recommendation: give transparent arrow controls a theme-aware foreground. Treat the filled pink page-number pills separately. Their black labels are an intentional paired treatment, not the same defect.

Standard: WCAG 1.4.11 for the required control graphic.

### 6. P2, services keep fixed black text over variable photo/translucent backgrounds

Affected route: `/`.

Evidence:

- Active service cards are rendered by `ServiceGrid` at `src/pages/index.astro:355`.
- `src/components/ServicesGrid.astro:47-50` builds 40% pink/orchid surfaces, a backdrop blur, and a 70% orchid hover surface.
- Titles use important `text-black` at `src/components/ServicesGrid.astro:57`; descriptions use `text-black` or `text-black/85` at `:62-64`, including black hover text.
- The parent intentionally supplies a background image for narrow widths at `src/pages/index.astro:357-367` and desktop at `:2136-2145`. The white section heading at `:2130-2133` belongs to this photo treatment.

Impact: service text does not adapt to dark mode, but the actual background is a blurred photograph. Dark portions of the photo can leave too little contrast behind a card. The main audit reported axe contrast as incomplete rather than a numeric failure. The saved `home-services-dark.png` shows cards covering both bright towel and dark stone regions.

Recommendation: control the text backdrop with an opaque or sufficiently strong scrim/card surface, then verify the fixed pair in each theme. Do not merely turn all card text white. That would create a different failure over the bright pink/towel regions. Do not claim that every card fails a particular contrast ratio without pixel-level background sampling.

Standard: WCAG 1.4.3 verification remains incomplete for image-backed text.

## Route-by-route coverage

| Route | Page/content assessment |
| --- | --- |
| `/` | White `.mobile` panel failure, FAQ fixed dark colors, review intro failure, image-backed service contrast risk. The about and benefits blocks have active paired dark overrides. |
| `/mobile-massage/` | Both `.mobile` panels stay white. FAQ fails. The photo captions and CTA are not plain dark-canvas text; audit those against their photos. |
| `/about/` | The live `#sbs` section has working paired dark rules. FAQ is the shared failure. |
| `/contact/` | The two white booking cards fail. The photo-backed email/phone/address panel uses white text and its own darkening overlay, intentionally. |
| `/direct-billing/` | Main heading keeps important pink intentionally; ordinary list/paragraph copy is covered by the global dark rule. Shared review introduction fails. The section ID contains a trailing space at `src/pages/direct-billing.astro:29`, so a future `#direct-billing` selector would not match this exact ID. No existing dark rule relies on it. |
| `/gallery/` | Local gallery tokens and tab rules do switch. Viewer stays intentionally dark in both themes. One small count-label contrast issue is listed below. |
| `/gallery/client/`, `/gallery/events/`, `/gallery/inside/` | These are old picture-grid pages with Landing, images, CTA, and a button. No separate text/background dark-mode defect found beyond shared components and existing image/text contrast concerns. Do not confuse their `#gallery` markup with the modern gallery page. |
| `/giftcertificate/` | Most local content has complete paired dark rules: benefits, gift options, and steps. Shared review introduction fails. The page uses SecondaryLayout; absence of shared header/footer should not be interpreted as proof of successful full-site dark styling. |
| `/booking/` | The main content is a cross-origin MassageBook iframe. Parent CSS cannot theme its document. This audit does not certify that external widget as dark-mode compatible. |
| `/reviews/` | Shared review introduction fails. Review cards use the variable that actually changes in dark mode. Landing is intentionally photo-backed. |
| `/blog/` | Recent articles and featured sidebar have matching, active dark LESS. Bare pagination arrows fail. |
| `/blog/[post]/` | Post title, metadata, rendered headings, paragraphs, lists, and links have explicit matching dark LESS. No inline content color overrides found in the 11 current Markdown posts. |

## Active LESS versus stale selectors

| Selector/rule | Does it match current markup? | Evidence and consequence |
| --- | --- | --- |
| Homepage `body.dark-mode #services` | Yes, but only the Announcement panel | The live `id="services"` is at `src/pages/index.astro:244`; the dark background is at `:1467-1468`. It does not cover the separate `.mobile` section at `:288` or `#massage-services` at `:351`. |
| Mobile route `body.dark-mode #services` | No active section | The old opening section is commented at `src/pages/mobile-massage.astro:223`; the active sections use only class `mobile` at `:330` and `:414`. The dark block at `:1313-1326` cannot fix them. |
| Hero `.cs-background:before` darkening | No matching element | The rules are at `src/pages/index.astro:1107-1112`, `src/pages/mobile-massage.astro:954-959`, and `src/pages/giftcertificate.astro:552-557`. Current heroes use CSS `background` images; the optional/hidden Picture uses `.cs-picture`, not `.cs-background`. These darkening rules are stale, but the white hero text is a separate intentional photo treatment, not evidence that every hero fails. |
| Homepage `#sbs` and `#sbs-r` | Yes | Active markup at `src/pages/index.astro:374` and `:566`; paired foreground, quote surface, photo-frame, and job-text overrides at `:1644-1687` and `:1844-1887`. Preserve these working pairs. |
| About `#sbs` | Yes | Active section at `src/pages/about.astro:31`, dark rules at `:271-312`. The quote surface changes from `#f7f7f7` to `var(--accent)` at `:300-301`, with light copy at `:292-306`. |
| Homepage `#gallery` | No | The dark rule at `src/pages/index.astro:2003-2011` has no active homepage gallery section. It does not apply to the separate gallery route. |
| Mobile `#introduction`, `#sbs`, `#sbs-r`, `#gallery`, `#reviews`, `#sbs-1067`, `#blog`, `#massage-services` | No active corresponding sections | The current mobile page renders hero, popup, two `.mobile` sections, FAQ, and CTAcopy. The legacy blocks at `src/pages/mobile-massage.astro:967-1039`, `:1335-1734`, `:1741-1860`, `:1867-2029`, `:2037-2173` do not theme those active sections. In particular, the old review classes `.cs-item-p`, `.cs-reviewer`, `.cs-desc` at `:2013-2026` do not describe the current Review component. |
| Contact `#cs-form` dark rules | No active form | Form markup is commented at `src/pages/contact.astro:80-139`; the dark field rules at `:483-495` are latent and do not cover the replacement booking cards. |
| Gift `#RPsbsr-1587` | No active reverse section | Markup is commented from `src/pages/giftcertificate.astro:129`. The paired selector at `:765` still also matches the active `#RPsbs-1587` benefits section, so that whole dark block is not dead. The standalone reverse-background rule at `:810-814` is inactive. |
| Gift `#gallery-1152` and `#steps-1893` | Yes | Active markup at `src/pages/giftcertificate.astro:194` and `:221`; working dark overrides at `:933-944` and `:1163-1198`. Beige steps background at `:955` is overridden in dark mode at `:1167`. Do not report the light-mode beige as an unhandled dark background. |
| Blog `.recent-articles`, `.blog-sidebar`, `.blog-article #blog-content` | Yes | Matching markup is at `src/pages/blog/[...page].astro:59-95`, `src/components/FeaturedPost.astro:14-32`, and `src/pages/blog/[post].astro:48-83`. Dark rules at `src/styles/blog.less:340-394` have enough specificity to beat later normal light rules. |
| Blog `#header`, `#cs-footer` template blocks | Not the live Landing/footer | `src/styles/blog.less:80-130` styles `#header`, but Landing uses `#int-hero` at `src/components/Landing.astro:6`. Blog's `#cs-footer` rules begin at `src/styles/blog.less:674`; the shared Footer uses a different ID, outside this component audit. Do not assume these old blocks protect the current shared components. |

`--primaryDark` appears only in the homepage and mobile `#services picture` rules at `src/pages/index.astro:1471` and `src/pages/mobile-massage.astro:1318`. It has no declaration in the audited styles. The homepage declaration is invalid at computed-value time, while the mobile rule is also on stale markup. This is not the cause of the missing `.mobile` panel override and should not be presented as the main defect.

## Intentional photo and always-dark treatments

- `Landing` is explicitly image-backed with a 70% black overlay at `src/components/Landing.astro:43-53` and white title at `:74-83`. It should stay light-on-photo in both themes. The black overlay is not an unthemed dark-mode background bug.
- Shared `CTA` deliberately uses white heading/body text at `src/components/CTA.astro:12` and `:18` over a picture at `:31-42`. It has no guaranteed scrim, so photo contrast deserves separate verification, but white text alone is not a dark-mode regression. `CTAcopy` likewise uses white text at `src/components/CTAcopy.astro:88` and `:105`; its proposed overlay content is commented at `:65-70`, so do not claim an active 70% overlay exists there.
- The contact details panel intentionally has light labels/links at `src/pages/contact.astro:298-315`, photo/gradient at `:349-374`, and further photo darkening at `:497-503`.
- The gallery viewer intentionally has `#171315`/`#0d0b0c` backgrounds and pale text at `src/pages/gallery.astro:457-492`, `:526-560`. Its light close button and “View” badge both explicitly pair pale backgrounds with dark text at `:413-425` and `:501-513`. These are sound local color pairs, not missing dark variants.
- Gift certificate CTA `#cta-51` has white text at `src/pages/giftcertificate.astro:1233-1239` and an active 80% black photo overlay at `:1296-1307`. Its dark block is intentional and already self-contained.

## Lower-priority and baseline notes

These should not displace the disappearing page content above.

- The modern gallery's small photo-count span keeps `#b54d7f` at `src/pages/gallery.astro:339-343`, with no dark override among `:654-673`. That is roughly 3.89:1 against the base `#12110f`, below 4.5:1 for its 12px text. The actual gallery background also includes a faint gradient. P2, low impact because each count supplements the category label, but it still needs a tested dark color.
- White/near-white text on the brand pink buttons is a site-wide baseline issue, not a dark-mode-only regression. Examples are `src/components/CTA.astro:25`, `src/pages/index.astro:169`, and `src/pages/contact.astro:45`. `#fff` on `#f3117e` is about 4.04:1, below the 4.5:1 requirement for normal 16px bold text. The near-white hover on `#ff66ad` is about 2.61:1. The main audit should handle the shared button palette once, not create one issue per route.
- Blog “Continue Reading” controls explicitly pair `--headerColor` with a pink surface and a white hover surface at `src/styles/blog.less:265-305`. They are not black-on-dark text. The dark `#1a1a1a` on `#f3117e` pair is about 4.30:1, a baseline contrast issue rather than a theme-switch defect.
- `PromotionCard` is not rendered by any current active page markup. The only apparent invocation, `src/pages/mobile-massage.astro:298-302`, is inside the commented section from `:261-326`. The homepage imports the component at `src/pages/index.astro:14-16` but does not invoke it. Its `color-black` class at `src/components/PromotionCard.astro:31` is not a Tailwind text-color utility, and its link foreground depends on inheritance. These are latent component concerns, not visible route findings.
- Booking's iframe at `src/pages/booking.astro:59-63` points to `https://www.massagebook.com/therapists/StoneMassage/widget/services`. The parent cannot change cross-origin colors with local CSS. Treat it as an external document. It needs a separate product decision or vendor-supported theme option, not a forced stylesheet selector.

## Suggested repair order

1. Repair the white `.mobile` panels and contact booking cards. They hide useful text completely.
2. Establish theme-aware heading/body/interactive foreground tokens or component rules, then apply them to FAQ, review introduction, and bare pagination arrows. A token change alone must account for important utility classes and photo/light-card exceptions.
3. Stabilize service-card text backdrops and test default/hover states over the full photograph on mobile and desktop.
4. Preserve the working local dark pairs in about, gift certificate, blog, and gallery. Remove or update stale selectors only after checking their real markup targets.
5. Run the existing main audit's dark/light route checks again. Include opened and closed FAQ rows, enabled pagination arrows, photo-backed cards, and hover states. Treat image contrast as incomplete until measured.
