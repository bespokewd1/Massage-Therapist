# Implemented homepage performance fixes

22 October 2026. Changes are local and have not been deployed.

## Shipped source changes

- `src/pages/index.astro`: remove unused home-only landing-image preload and build-time optimization call/imports; preserve both media-specific hero preloads; assign system/emoji font stack only to map pin; generate responsive AVIF add-on images.
- `src/layouts/BaseLayout.astro`: put charset/viewport metadata before router, scripts and head slot so responsive hints see the intended viewport.
- `src/components/Header.astro`: eager responsive header logo with 100/200/300px WebP candidates and sizes100px. Original image and footer usage unchanged.

No CSS inlining, router removal, tracking changes, typography replacement, copy changes, favicon/manifest work, or deployment configuration changes. Assumed the current appearance and behavior should remain intact.

Image generation constants changed: header fallback100x100 and candidates100/200/300, sizes100px; add-on fallback320x320 and candidates96/160/256/320/480, sizes `(min-width: 1350px) 108px, (min-width: 768px) 10vw, 20vw`. These conservative hints cover measured layout through DPR3. Display dimensions remain unchanged. All nine measured widths, 320–1920px, have zero logo/icon width deltas; decoded mobile icons also match baseline.

## Optional font preload was tested and rejected

Three local cold runs each with/without Open Sans500 preload. Median LCP with hint3454ms, without3379ms; medianFCP1953ms either way. No consistent gain, so the final source contains no extra font preload. The original Open Sans500 face and swap behavior remain.

## Validation

- Production build passed.
- Existing SEO/theme suites:13 tests passed.
- SEO output check passed:34 HTML routes,11 articles,20 PNG cards,zero editorial warnings.
- Browser confirmation:284 checks passed,zero failures, across mobile390x844 DPR3 and desktop1440x1000 DPR1 in both themes, plus system-theme behavior.
- Menu and Escape, dialog destinations/focus/Escape, FAQ keyboard, sticky booking, back-to-top and client navigation to about and back remain functional.
- No homepage landing-image or Roboto requests. No desktop hero request on mobile.
- Browser screenshots saved under `qa/`. No horizontal page overflow. Header/icons decode responsive generated candidates.
- Content, navigation destinations, title and canonical are unchanged. `git diff --check` clean.

Initial QA's dialog containment assertion incorrectly rejected Tab moving to browser chrome. An isolated before/after probe confirmed identical native behavior: the document loses focus and background page controls never receive focus. The verifier was corrected to test that actual requirement. No application workaround was added. Baseline/probe data retained.

## Measured local comparison

Gzip local HTTP/1.1 server, same native mobile Lighthouse13.5 defaults,three cold runs before and three final no-font variants. Median performance85→90, medianLCP4055→3379ms,about17% lower. MedianFCP1954→1953ms. CLS0.0133 unchanged. Baseline first run and font-hint first run had large LCP outliers. A separate final all-category run scored83performance/100accessibility/96bestpractices/100SEO withLCP4.4s. Report every run rather than selecting the best. These loopback results are not comparable with deployed PageSpeed96 and cannot establish a production100.

One representative default mobile request set removes205383 resource bytes,about200.6KiB, through unused landing112886, extra desktophero18502, Roboto15688 and smaller logo/icons. Actual savings depend on DPR and selected candidate; QA atDPR3 selected300px logo and256px icons. This does not imply every screen saves200KiB.

Existing JPEG manifest syntax error, legacy footer social assets and marquee swap lifecycle issue are outside this pass and remain documented in the original audit. Build also retains existing Browserslist/LQIP warnings. No dependencies were changed.

Next: deploy through the normal workflow, then repeat production mobile PageSpeed several times before deciding whether CSS inlining is worth a second pass.
