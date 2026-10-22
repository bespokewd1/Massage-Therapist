# Shared component dark-mode repair

Date: 2026-10-22

## Changes

- `src/components/Header.astro`: removed important white navigation utilities and destructive logo/icon filters. Kept the existing light gradient and layout. Added paired light/dark navigation colors, fixed dark-pink text on the white announcement chips, visible focus, and transform-based desktop underlines. Announcement colors now follow `body.dark-mode` only.
- `src/components/Footer.astro`: retained the layout and pink top edge. Added warm dark background, readable text and link colors, focus outlines, a white backing behind the unchanged logo in dark mode, and transform-based link underlines.
- `src/components/FAQ.astro`: uses semantic text and border tokens. Open questions use dark `--on-selected` text on pale orchid. Native details/summary behavior remains. Removed padding animation and added reduced-motion and focus styles.
- `src/components/Review.astro`: uses paired review surface/text tokens, a dark-text pale-orchid hover, and action tokens for avatar initials. Corrected the introduction to Stone Massage. The three approved testimonials are unchanged.
- `src/components/ServicesGrid.astro`: replaced photograph-dependent transparent card backgrounds with opaque `--service-surface` and `--service-text`. Preserved the photo section, card arrangement, and copy. Hover uses pale orchid with dark text.
- `src/components/CTA.astro` and `src/components/CTAcopy.astro`: added a guaranteed warm-black photo scrim and explicit image/content stacking. Overlay text remains fixed near-white. Action labels use the action pairing. Removed contradictory fixed-white action text.
- `src/components/React/Pagination.tsx`: transparent arrows now use the heading foreground token. Enabled arrows and page links have accessible names and keyboard focus. Unavailable arrows are non-interactive spans, not fake links. Filled page pills use action tokens. Modified-click behavior and reduced-motion navigation remain native.

The shared booking chooser is now a native `dialog#booking-dialog` with a visible title, a semantic panel, a controlled backdrop, and a native Close form. The Header trigger calls `showModal()`. Parent owns the matching StickyButton trigger and removal of duplicate page popups. Existing booking destinations are unchanged.

## Color and motion constants

- Header light navigation and focus: `#000000`. It gives 5.19:1 against the brightest existing pink gradient stop, `#f3117e`.
- Header light menu/hover: `#ffffff` / `#fff0f7`. Dark menu/hover: `#34281e` / `#463428` with `#f5f1ed` text. Dark focus: `#f984ef`.
- Announcement light gradient edges: `#b80d64`; middle: `--action-bg`. Dark edges/middle: `#7a0a45` / `#a40e5e`. White-chip labels stay fixed `#b80d64`, 6.40:1 against white.
- Footer dark background/text/muted: `#211c18` / `#f5f1ed` / `#cfc5bd`. Light footer text remains black.
- Both photo CTA scrims: `rgb(18 17 15 / 70%)`. Even over a white photo pixel, the composite is approximately `#595857`, above 6.7:1 with `#fafbfc` text.
- Pale-orchid hover text: `#1a1a1a` on existing `#f984ef`, 7.94:1.
- Existing pagination delay stays 300ms. Reduced-motion and modified-click paths bypass the delay.
- Brand `--primary` and `--secondary`, assets, routes, photo layout, and testimonial facts were not changed.

## Verification and limits

Used the installed project Node dependencies only. Parsed all seven Astro components with `@astrojs/compiler`, compiled each owned LESS block with `less`, and transpiled the pagination TSX with the installed TypeScript compiler. All passed. Source assertions confirm removal of the Header logo filter/forced-white navigation, the old Header popup id, and contradictory service/review text utilities. Fixed-pair contrast values above were calculated with the WCAG relative-luminance formula.

No browser, screenshot, build, dependency install, or commit was run by this worker. Parent owns the single combined build and batched desktop/mobile inspection, then at most one confirmation round. This note does not claim a rendered WCAG pass.

Existing uncertain footer social destinations remain untouched. CTAcopy still uses the pre-existing living-room template photo; replacing factual imagery needs separate direction. External MassageBook content remains outside local CSS control.
