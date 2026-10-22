# Astro 5 LCP follow-up

## Scope

Update Astro 5.4.2 to pinned 5.18.2, migrate the existing Open Sans and Poppins files to the experimental local Fonts API, compare selective heading-font preloading, test bounded CSS inlining, and correct favicon delivery. Preserve appearance, content, booking, navigation, and themes. GTM, cache headers, CMS publishing, and Astro 6/7 migration are excluded.

Work is on branch `perf/astro5-fonts-lcp`. No production deployment or remote push has been performed.

## Implementation

- Only Astro changed among the 25 direct dependencies. `package-lock.json` includes its required transitive updates.
- `.nvmrc` pins the tested Node 24.22.1 runtime. Use it for the Netlify preview build too. The resolved font-provider dependency requires at least Node 22.19.0, despite Astro's broader engine declaration.
- `astro.config.mjs` uses `fontProviders.local()` for the original Open Sans 400/500/600/700/800 and Poppins 400 WOFF2 files.
- `src/components/SiteFonts.astro` declares the fonts in the main layout, secondary layout, and standalone booking document. CSS uses the managed family variables while retaining the original fallback chains and `font-display: swap`.
- `src/components/PersistedFontStyles.astro` annotates the native Font stylesheet at build time so ClientRouter retains it across page swaps. It uses public slot rendering, emits no wrapper element or client JavaScript, and hashes the CSS for the persistence key. Changing a preload does not recreate font styles; changing font CSS invalidates the key. Astro 5's Font component does not forward `transition:persist` to its style element, so passing that directive directly would not work. The wrapper's native-output assertion and cross-layout key tests are intentional compatibility guards for the pinned experimental API.
- Only the homepage preloads Open Sans 500. Its LCP difference versus no preload was negligible, but FCP and CLS improved in the paired comparison. Other weights and Poppins are not preloaded.
- Automatic fallback substitution is deliberately disabled to preserve the original rendering. Font files are copied unchanged into `src/assets/fonts/`; old public URLs remain available for cached pages and compatibility. Social-card WOFF fonts and Roboto are unchanged.
- CSS inlining uses Astro's supported `inlineStylesheets: 'auto'` and a CSS-only 20 KiB Vite size callback. No rules are removed, no print-media loading tricks are added, and the large shared global stylesheet remains external. Image/font asset-inlining limits remain unchanged.
- `src/components/SiteIcons.astro` shares correctly sized PNG declarations and a valid Stone Massage browser manifest. Existing assets, including the JPEG used for blog avatars, are retained. No service worker or standalone app mode is added.
- The header logo is unchanged. Trials at 100/200/300 pixels found negligible exact-pixel savings. Higher compression either saved only around 2% or changed the image, so it was not accepted.
- Astro's changed collection enumeration reordered two featured sidebar links. `src/data/featured-post-order.json` preserves the baseline order explicitly, with new featured posts following it by ID.
- An explicit absolute `/book` redirect destination preserves the original generated redirect output; `public/_redirects` is unchanged.

## Measured results

Five interleaved cold-browser mobile selection runs on the same local Brotli server, with identical third-party blocking. This comparison preceded the font-persistence marker fix; final post-fix verification is recorded below.

| Metric                   | Original build | Final candidate |
| ------------------------ | -------------: | --------------: |
| Median LCP               |        3.377 s |         2.252 s |
| LCP range                |  3.377–4.582 s |   1.964–2.258 s |
| Median FCP               |        1.951 s |         1.801 s |
| Median CLS               |        0.01330 |         0.00915 |
| Median TBT               |           0 ms |            0 ms |
| Median performance score |             90 |              97 |
| Performance score range  |          82–90 |           97–99 |

This is approximately 1.12 seconds, or 33%, lower median LCP in the controlled comparison. It is not a prediction of a deployed PageSpeed score. The LCP element remains the homepage heading, not the background image.

The same final candidate without the 500 preload had median LCP 2.252 s, FCP 1.951 s, and CLS 0.01330. Preloading therefore did not establish an LCP benefit; it was retained for the roughly 150 ms FCP improvement and lower CLS without meaningful LCP regression.

The Astro-update-only comparison had median LCP 3.381 s. The update alone was not accepted as evidence of an improvement. A preliminary three-run experiment favored the 20 KiB CSS threshold over the 13 KiB threshold; the combined final result also includes favicon delivery changes.

The 20 KiB policy changes five homepage external CSS requests to one. Final local Brotli HTML grows from 75,524 to 82,685 bytes, a 7,161-byte increase including font-persistence markers. The remaining shared global CSS is 43,185 decoded bytes. This trades some cross-page stylesheet caching for fewer blocking round trips; cache headers themselves are unchanged.

Three desktop runs retained median performance 100. Median LCP was 0.702 s before and 0.517 s after. The first desktop baseline run overlapped the short validation build, so the desktop median and the two subsequent baseline runs are the useful comparison, not the first-run difference.

A separate three-run mobile verification left third-party requests enabled. GTM returned HTTP 200 and transferred approximately 119 KB. Median LCP was 3.377 s before and 2.177 s after; the final score was 98 in all three runs. This remains a local-host verification, not a Netlify/PageSpeed deployment result. The analytics source and loading implementation were not changed.

The final post-persistence-fix verification repeated three paired mobile runs with third parties enabled: median baseline LCP 3.452 s, final LCP 2.179 s, final FCP 1.802 s, final CLS 0.00999, and final TBT 0 ms. All three final performance scores were 98. Final LCP ranged from 2.178 to 2.206 s. Results are in `final-verification.json`.

Compact results are saved in `mobile-comparison.json`, `desktop-comparison.json`, `mobile-third-party-enabled.json`, `resource-comparison.json`, and `static-comparison.json` alongside this report. Raw reports and browser screenshots remain in the external evidence directory below.

## Automated checks

`npm test` rebuilds before running the generated-output tests:

```sh
npm ci
npm run build
npm test
npm run check:seo
npx astro check
```

`scripts/performance.test.mjs` protects the pinned version, exact original font binaries, generated font coverage, constrained preloading, hero preload media conditions, bounded CSS inlining, correct icon dimensions, valid manifest, featured-post ordering, and unchanged GTM bootstrap.

The final `npm test` rebuild and all 21 tests pass. SEO validation passes for 34 HTML routes, 11 articles, and 20 PNG cards with no editorial warnings.

An additional build with isolated, empty image/font caches produced byte-identical output for all 366 compared files. There were no missing files, changed HTML documents, or changed social cards. The measured candidate therefore does not depend on reusing old image-cache output. Evidence is in `fresh-build-comparison.json`.

The original type check reports three `Header.astro` errors concerning dropdown children inferred as `never`, plus six hints. These also occur before the upgrade. They are recorded rather than hidden or repaired as unrelated work.

## Evidence and limitations

Full local build snapshots, Lighthouse reports, and browser evidence are outside the repository at:

`C:/Users/tingDev/AppData/Local/Temp/opencode/stone-lcp-followup/`

The immutable baseline contains 34 generated HTML routes, 11 articles, and 20 social cards. Static comparisons verify identical route inventory, visible text, sitemap, and byte-identical social cards after restoring featured-post order and redirect output.

The browser baseline covers 154 route/viewport/theme combinations with 258 screenshots and 180 functional checks. Mobile is 390 x 844 at DPR 3; tablet is 768 x 1024 at DPR 2; desktop is 1440 x 1000 at DPR 1. Screenshots freeze motion and await loaded fonts/images. These captures are not performance timings.

Visual QA blocks third-party requests only in test contexts. Booking destinations and the iframe are checked without making appointments or calls. A blocked CMS login script does not prove that the full CMS initializes; no authentication, editing, or publishing is attempted.

The final full browser pass also completed all 154 route/viewport/theme combinations and 180/180 interaction checks. All 456 actual-font samples matched. Main text, headings, links, canonical metadata, sampled geometry, and computed typography/colors were unchanged. Favicon/manifest head-link differences were expected. The original clipped body-width observation on desktop-light `/mobile-massage/` is preserved, not silently repaired.

CMS loading was separately checked with the required external Decap and Identity libraries allowed. Baseline and final both passed 6/6 checks and rendered identical unauthenticated login UI. Admin HTML and configuration are unchanged. All non-GET/HEAD requests were blocked, including automatic local-backend POST probes; login, editing, and publishing remain untested.

### Image-encoding variance

Pixel-perfect image output is not claimed. Of 78 selected local image pairs, 63 are byte-identical and 15 generated outputs have codec differences: 13 AVIFs and two 60px WebP sidebar thumbnails. Original artwork, dimensions, crops, and requested quality settings are unchanged. The full initial screenshot comparison had 156/258 pixel-identical captures; most remaining differences were below its review threshold.

Although the project's direct Sharp dependency remains 0.34.5, Astro previously resolved its own nested Sharp 0.33.5. Astro 5.18.2 requires Sharp `^0.34.0`, so its effective native image stack changes too. This accounts for differences in encoded pixels, including some transparency-edge values on four mobile-massage cards. No supported settings-only exact compatibility fix was found. The older encoder was not forced back in, and baseline generated assets were not copied into source.

A separate targeted confirmation covers the gallery-events JPEG screenshot residual and post-navigation cascade. Review the confirmation evidence and affected images on the preview before production approval. Source image files and requested fonts remain unchanged; image-byte equality must not be confused with visual or functional equality.

Both settled cold/warm gallery confirmation captures were pixel-identical. The earlier softness was transient browser rasterization, not a source or persistent CSS change. Offline light/dark review of the four transparent cards found no material new halos at the recorded display sizes. Their area-weighted RGB difference was 0.741/255, with an alpha-only contribution of 0.0167/255. Small codec color/texture differences remain and should be reviewed on the preview; no old-encoder override was applied.

### ClientRouter font lifecycle

The initial navigation confirmation found a real regression: replacing unmarked native font styles caused new temporary font-loading metric changes in 19 of 32 paired states. Five persisted through the second sampled frame. Steady typography already matched, so initial-load screenshots alone would not have caught this.

After adding content-keyed stylesheet persistence, the focused regression check completed 64 real swaps across 32 paired states with zero new font-loading metric changes, zero steady text/style/geometry/font differences, and zero head-order or duplicate-preload failures. All 320 persisted style-node checks retained the same nodes, sheets, and rules. Evidence is in `font-persistence-check.json` and the external `qa/font-persistence-fix/` directory.

The strict assertion that individual original `FontFace` objects remain members fails in both baseline and fixed builds. The `FontFaceSet`, style nodes, sheets, rules, and typeface keys are the useful identity checks; individual FontFace-object identity is not claimed. Two baseline-shared asynchronous gallery-height transitions lasted one extra animation-frame sample with fonts already loaded. These raw caveats and strict assertion failures are retained rather than relabeled as universal passes.

Controlled Lighthouse comparisons use the same local Brotli-compressed server, browser, mobile throttling, cold browser storage, and identical third-party blocking for every variant. They isolate first-party changes and are not deployed PageSpeed or real-user measurements. A separate verification can leave third-party requests enabled. Never compare a controlled local score directly to the supplied production score.

## Remaining security risk

This compatibility update is **not** a complete security remediation. Lockfile-only audits report 54 package vulnerability entries before and 43 after, with six critical entries remaining. No automatic audit fixes were applied.

Astro 5 remains affected by [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2), involving code execution when processing a malicious untrusted AVIF image through the default Sharp image service. The advisory's published framework fix is Astro 7.2.8 with Sharp 0.35.4. The current static site has no runtime image endpoint, but build-time processing of untrusted input remains a concern. Do not treat the lack of an SSR endpoint as a complete mitigation. Restrict image inputs to trusted sources and review separate security remediation before production approval.

Other existing advisories remain in the framework and tooling dependencies. A future security update needs its own reviewed scope; the user explicitly deferred the Astro 6/7 migration.

## Preview and release checklist

1. Confirm the Netlify preview build uses Node 24.22.1, `npm ci`, and `npm run build`.
2. Run generated-output tests and SEO validation against that build.
3. Review mobile/tablet/desktop light and dark pages, plus the logo, icons, heading wraps, and blog sidebar.
4. Exercise menu/dialog keyboard behavior, booking iframe and direct links, FAQ, gallery, pagination, sticky/back-to-top controls, theme persistence, internal navigation, and browser history.
5. Check `/admin/` loading without editing or publishing.
6. Run repeated mobile and desktop PageSpeed tests on comparable deployed builds. Aim for lower mobile LCP without functional, visual, CLS, or desktop regressions; 2.5 seconds is a target, not a guarantee.
7. Review the remaining dependency advisories before approving production.
8. The site owner publishes after preview approval. Retain the previous Netlify deployment for rollback. Do not undo unrelated work to roll back this branch.

## References

- [Astro 5 experimental Fonts API](https://v5.docs.astro.build/en/reference/experimental-flags/fonts/)
- [Astro stylesheet-inlining configuration](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets)
- [web.dev LCP optimization](https://web.dev/articles/optimize-lcp)

Context7 lookup was attempted but its monthly quota was exhausted. API details were checked against official Astro v5 documentation and the installed 5.18.2 implementation.
