# Homepage mobile performance audit

22 October 2026. Deployed page: https://stonemassage.ca/.

Audit only. No application source, configuration, dependencies, or constants were changed. `npm run build` passed, and its homepage HTML matched the deployed HTML after newline normalization. The audit assumes the current appearance, content, typography, navigation, themes, and booking behavior should stay intact.

## Baseline

| Metric | Supplied PageSpeed screenshot | Fresh live Lighthouse 13.5.0 |
| --- | ---: | ---: |
| Performance | 96 | 94 |
| First Contentful Paint | 1.8 s | 1.64 s |
| Largest Contentful Paint | 2.4 s | 2.65 s |
| Total Blocking Time | 80 ms | 147 ms |
| Cumulative Layout Shift | 0 | 0.00076 |
| Speed Index | 3.1 s | 2.26 s |

The live trace identifies `#hero h1`, “Relax. Rejuvenate. Revive.”, as LCP. CDP confirms Open Sans 500 renders that heading. The hero background is not the LCP element in these runs. The mobile background is already only 9,450 bytes. There is no CrUX field data in the supplied report, so these are lab results, not real-user percentiles. Scores vary with browser version, hardware, network conditions, and third-party work. A repeatable 100 cannot be promised.

## Recommended first pass

1. **Remove the unused homepage landing-image preload.** `src/pages/index.astro:22,32,85-87` imports and optimizes `landing.jpg` solely to pass it to `BaseLayout`; `src/layouts/BaseLayout.astro:56` emits the hint. The generated WebP is 112,886 bytes, about 110.2 KiB, and has no consumer in homepage markup or linked CSS. Its transfer is confirmed in the live network log. Remove the home-only prop and now-unused imports/call. Preserve the shared layout preload capability for other pages.
2. **Move charset and viewport metadata before the head slot and responsive preloads.** In `BaseLayout.astro:47-52`, the head slot comes first. Mobile requests currently include both the desktop `hero-img.avif`, 18,502 bytes, and mobile `hero-img_mobile.webp`, 9,450 bytes. The audit-only variant puts viewport metadata at the start of the real head and retains both media-specific hints; it requests only the mobile hero. Avoid deleting the responsive hero hints entirely.
3. **Test a homepage-only Open Sans 500 preload.** This is the actual LCP font, 18,720 bytes. Use `as="font" type="font/woff2" crossorigin`. Do not preload every weight. All faces already use `font-display: swap`. The priority experiment below bundles this with items 1 and 2, so it does not establish the font preload's independent effect.
4. **Give the map-pin emoji an emoji/system font stack.** `index.astro:256` inherits Open Sans then Roboto. Four read-only browser variants and CDP show the pin causes a 15,688-byte Roboto400 request, even though Segoe UI Emoji actually renders it and no visible text uses Roboto. Assign `system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif` to that element only. Keep Roboto globally because the contact page explicitly uses it. This is a byte saving, not proof of an LCP saving.
5. **Right-size generated images without changing layout.** The header logo currently serves a 500px, 59,792-byte WebP to a roughly 90px transformed display. Generate multiple candidates appropriate to 1x/2x/3x screens. The three mobile-service icons are 1024px AVIFs totaling about 25 KiB but render much smaller. Add `widths`/`sizes` based on actual flex sizes and device pixel ratio. Keep the original logo, which is also used by the larger footer logo. Keep below-fold icons lazy; make the visible header logo eager. The supplied image estimate is 81 KiB; the fresh run estimates 97 KiB including a promotional image, but estimates 0ms FCP/LCP improvement. This is still worthwhile transfer cleanup, not the main guaranteed score lever.

## CSS decision

The five stylesheets total 101,452 uncompressed bytes and roughly 17 KiB compressed. Filenames beginning with `about` are shared global/header/footer output, not evidence that the homepage imports the about page. Do not delete them by filename.

The supplied run estimates 590ms savings from render-blocking CSS, while the fresh live run estimates 0ms. Treat that estimate as conditional. A clean experiment is Astro `build.inlineStylesheets: 'always'`; it is supported by installed Astro 5.4.2. However, inlining adds about 100 KiB raw CSS to each affected document and loses external shared CSS cache reuse. Prefer a measured decision rather than making all CSS asynchronous. Hero/navigation/theme styles must be available for first paint.

### Audit-only response experiment

A temporary Node server returned variants of built HTML without editing `dist/` or application source. Responses used gzip. Two cold mobile Lighthouse runs per variant used the same local HTTP/1.1 server. This is directional evidence only: loopback HTTP/1.1 timing and simulated network scheduling are not comparable with the production HTTPS/CDN score. Six runs are not enough to claim statistical stability.

| Variant | Performance, two runs | FCP range | LCP range |
| --- | --- | --- | --- |
| Unchanged output | 81, 85 | 1.95–2.10 s | 4.05–4.71 s |
| Remove unused preload + early viewport + preload Open Sans500 | 90, 88 | 1.88–1.95 s | 3.38–3.75 s |
| Same priority changes + inline five stylesheets | 91, 91 | 1.80 s | 3.38 s |

LCP remained the same H1 with identical bounding boxes across valid runs. The priority variant removed both the unused landing request and the extra desktop hero request. The data supports fixing request priority first. Inlining is worth a staging test, not a promise of 100. A malformed preliminary experimental response was discarded and corrected before these retained results; no app files were involved.

## Other confirmed findings

- `BaseLayout.astro:76` uses a JPEG as `rel="manifest"`. The fresh report logs a manifest syntax error and scores Best Practices 96. Remove the link if no installable app is intended, or supply valid JSON. The shared favicon/author JPEG is 917×963 and 78,101 bytes; generate actual small favicon assets separately. This is not a performance-score fix by itself.
- Both returned assets and HTML use Netlify `public,max-age=0,must-revalidate`. Consider long-lived immutable browser caching for content-hashed `/_astro/*` assets. Do not apply that blindly to stable public URLs. This mainly helps repeat visits, not Lighthouse's cold load.
- Google Tag Manager transferred about 119 KiB and created a 75ms long task in the fresh run. It is already async. Inspect tags before adding more loading logic. Do not arbitrarily defer it until interaction or remove it, since that changes analytics collection. The unused-JS estimate gives 0ms FCP/LCP savings.
- The shared load handler that changes `media="print"` stylesheet links does nothing for the actual five stylesheet links. Deleting it is cleanup, not a meaningful score improvement.
- The marquee initializes only on DOMContentLoaded and retains detached nodes after Astro swaps. Repair its page-load and cleanup lifecycle separately. This is a behavior issue, not an established initial-load bottleneck.

## Preserve working behavior

Do not remove ClientRouter merely to eliminate a 34ms reflow entry from the supplied screenshot. Sticky booking and back-to-top controls initialize only on `astro:page-load` and would remain hidden without replacement initialization. Gallery behavior also depends on router events. The fresh run did not reproduce the supplied forced-reflow warning. Preserve the early theme script, native booking dialog, keyboard access, current fonts, and near-zero CLS.

After implementing the first pass, compare at least three cold staging runs and repeat visits using the same browser/device settings. Check mobile and desktop, light/dark/system themes, menu and Escape, booking dialog focus return, sticky controls, footer back-to-top, and home-to-other-page-to-home navigation. Ship the changes, then repeat PageSpeed on production. Only expand CSS work if it still dominates.

## Evidence and references

- `live-baseline.report.html` and `.json`: fresh production Lighthouse run.
- `live-baseline-0.trace.json` and `.devtoolslog.json`: production trace and requests.
- `browser-audit.json`, mobile/desktop screenshots: DOM, font, resource and layout inspection.
- `assets-font-probe.json`: isolated emoji fallback variants.
- `head-order-requests.json`: request assertions for head-order variants.
- `experiment-summary.json`: retained local experiment results.
- `image-size-estimates.json`: illustrative encoder estimates, not production assets.
- `../2026-10-22-home-assets.md` and `../2026-10-22-home-code.md`: detailed source audits.
- https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets
- https://docs.astro.build/en/reference/modules/astro-assets/
- https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

No browser MCP connection was available. Playwright/CDP and Lighthouse CLI supplied browser, trace and accessibility measurements instead. Context7 monthly quota was exhausted; API syntax was checked against official documentation and installed Astro types/source.
