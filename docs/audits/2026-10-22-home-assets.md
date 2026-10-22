# Homepage assets and fonts audit

Date: 2026-10-22. Audit only. No application source or dependency changes.

The supplied mobile result is already strong: score 96, FCP 1.8 s, LCP 2.4 s, TBT 80 ms, CLS 0, and Speed Index 3.1 s. Treat the image warning as a byte-saving opportunity, not a promise of a higher score. The fresh saved Lighthouse report estimates **0 ms FCP/LCP savings** for image delivery and network chains.

## Ranked smallest changes

### 1. Remove the unused homepage landing-image preload

- `src/pages/index.astro:22,32,85-87` imports `landing.jpg`, optimizes it, and passes it to `BaseLayout` solely for preloading.
- `src/layouts/BaseLayout.astro:55-56` emits `/_astro/landing.D_wYLIJw_ZA4HG5.webp`. The built file is **112,886 bytes, 110.2 KiB**. The saved live report records 113,065 transfer bytes.
- Confirmed unused on the homepage. Its URL appears once in `dist/index.html`, as the preload, and nowhere in the five linked homepage stylesheets. No image or CSS background consumes it.
- Smallest fix: remove that homepage prop, import, and optimization call. Do not remove the shared layout capability because other pages use it.
- Keep the two hero-image preloads at `index.astro:89-109`. Their URLs and 768/769 px media queries match the backgrounds at `index.astro:692-703`. The mobile hero is only 9,450 bytes.

This removes a real early download without changing rendering. No visual tradeoff.

### 2. Stop the map-pin emoji from downloading Roboto

The 2.1 s font chain is not six fonts loading one after another. The saved live report shows Open Sans 400/500/600/700 and Poppins 400 start together near 1,201 ms. Roboto 400 starts later near 1,618 ms and finishes near 2,080 ms.

- The page inherits `Open Sans, Roboto, Arial, sans-serif` from `src/styles/root.less:248-250`. The hero repeats it at `src/pages/index.astro:587`.
- The map pin at `src/pages/index.astro:256` inherits that stack.
- CDP `CSS.getPlatformFontsForNode` found no rendered Roboto glyphs on the baseline page. The pin actually uses the system `Segoe UI Emoji` font.
- Read-only browser variants prove the cause. Removing just the pin removes the Roboto request. Removing punctuation does not. Keeping the pin but assigning `font-family: system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif` also removes the request.
- Smallest visual-preserving fix: assign that system-font stack to the pin only. Replacing it with the existing inline `Icon` component is another option, but changes its appearance.

Expected saving is **15,688 bytes, 15.3 KiB**, and the late fallback request disappears. Keep Roboto declarations globally unless checking other routes, because `src/pages/contact.astro:117` explicitly uses Roboto. A long dependency chain alone does not prove it delays LCP.

Evidence: `docs/audits/2026-10-22-home-performance/assets-font-probe.json`.

### 3. Test one critical font preload, not all font files

The parent browser trace identifies the hero H1 as LCP. It uses Open Sans 500 through `src/styles/root.less:84-86`; the face is defined at `root.less:198-205`.

A homepage-only head hint is a narrow test:

```html
<link rel="preload" href="/assets/fonts/open-sans-v40-latin-500.woff2"
      as="font" type="font/woff2" crossorigin />
```

Place it in the existing head slot at `src/pages/index.astro:88`. It starts the 18,720-byte font without waiting for CSS discovery. Keep only if repeated cold-load runs improve LCP. It can compete with the mobile hero image and CSS, so preloading all six fonts is not justified.

All local faces already use `font-display: swap`, `root.less:153-239`. The Google Fonts import at `src/components/Header.astro:16-18` is commented out and absent from built HTML. There is no active external Google Fonts dependency to remove or preconnect.

### 4. Add image dimensions for generated output, without changing CSS sizes

The imported files are optimized to modern formats, but retain full source dimensions because the `Image` calls omit generation widths.

| Image | Source reference | Current built resource | Small change |
| --- | --- | --- | --- |
| Header logo | `src/components/Header.astro:124-128` | 500 x 500 WebP, 59,792 bytes | Generate 100/200/300 px candidates, `sizes="100px"`, retaining current classes. Use `width={100}` and `height={100}` as the fallback. |
| Three mobile add-on icons | `src/pages/index.astro:221-247` | Each 1024 x 1024 AVIF. Combined 25,419 local bytes | Add responsive `widths` and `sizes`, retaining `class="w-1/3"`. For the measured layouts, 160/320/480 px candidates cover small mobile through about 134 CSS px at DPR 3. |

Astro supports `widths` with `sizes`, or `width` with `densities`; do not combine `widths` and `densities`. For icons, a conservative starting `sizes` is `(min-width: 768px) 10vw, 24vw`, based on the nested `w-5/6`, row, and `w-1/3` layout at `index.astro:213,219-247`. Verify the actual largest viewport and flex shrinking before finalizing it. Add larger candidates if supported layouts need them. A single 320 px icon is the smallest source edit, but is less sharp at 134 CSS px on DPR 3; responsive candidates avoid that compromise.

The screenshot's displayed sizes differ from the fresh local browser, which measured a 90 px transformed header logo. This is why candidate widths should cover the display and device pixel ratio, rather than use only a 98 or 134 px source.

Read-only Sharp estimates, using current default encoders:

- Logo WebP: 100 px = 7,808 bytes; 200 px = 19,358; 300 px = 33,162.
- Three AVIF icons combined: 160 px = 7,546 bytes; 320 px = 13,052; 480 px = 18,024.

These are illustrative byte estimates, not guaranteed Astro outputs or score gains. The existing 500 px logo is also used by the 160 CSS px footer image at `src/components/Footer.astro:28-32`. Do not shrink the original source file globally. Configure the header separately, and optionally give the footer its own 160/320/480 px candidates. All four current images default to lazy loading. Keep the below-fold icons lazy. Making the visible header logo eager is reasonable but lower priority because it is not the LCP element.

## What not to change for this result

- Do not remove Open Sans 500/600/700 declarations as "unused". The homepage requests them, and source styles use them. Consolidating weights or switching the Poppins navigation to Open Sans would change typography.
- Open Sans 800 and Roboto 700/900 are declared but absent from this run's font requests. Removing those declarations alone does not reduce this run's downloaded font bytes.
- A variable Open Sans font may reduce requests, but requires a new asset and weight/size comparison. It is not the smallest fix.
- Do not remove hero preloads or make all styles asynchronous merely to shorten a diagnostic tree.

## Scope and validation

Reviewed homepage source, shared layouts, compiled HTML/CSS, local asset sizes, and `live-baseline.report.json` from `docs/audits/2026-10-22-home-performance`. A read-only local browser test used Chromium, 390 x 844 viewport, DPR 3, on `http://127.0.0.1:4323/`. It isolated the emoji without writing application files. No new performance trace or post-change score was claimed.

Responsive image syntax was checked against installed `node_modules/astro/dist/assets/types.d.ts:187-200` and the official [Astro image reference](https://docs.astro.build/en/reference/modules/astro-assets/). Context7 lookup hit its monthly quota, so the official reference was retrieved directly. No constants were changed. Proposed dimensions are starting values and need visual checks at mobile and desktop widths.
