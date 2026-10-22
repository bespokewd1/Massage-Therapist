# Theme controller and navigation repairs

Date: 2026-10-22

## Changes

- Added `src/components/ThemeInit.astro` and `src/js/theme.js`. All three documents run the same inline controller at the start of the body, before visible content. `body.dark-mode` remains the only CSS selector for selected theme.
- The controller reads only `light` or `dark` as explicit stored choices. It follows OS changes without storing the inferred preference. Denied storage keeps explicit choices in memory. Browser-native `color-scheme`, `theme-color` from `--page-bg`, and toggle `aria-pressed` follow the resolved theme.
- A singleton guard and delegated toggle click listener prevent duplicate handlers. Astro incoming documents are themed before swaps; after-swap and page-load events synchronize the live document.
- Kept `dark-mode-toggle` as a 48px native pressed button. Replaced the remote sun image with a decorative local SVG. Button color uses header `--nav-text` or the semantic heading foreground. SecondaryLayout adds the same switch without a full header and no longer loads unused nav code.
- Added a descriptive title and direct MassageBook booking alternative to the booking iframe. The provider URL is the existing confirmed Header destination. The cross-origin widget keeps a deliberate white canvas and native `color-scheme: light`; no filters or inversion.
- Replaced per-page menu initialization with guarded delegated navigation handlers. Escape works without dropdowns, resets menu ARIA and restores focus to its toggle. Link navigation, outside clicks and Astro swaps dismiss the menu. Dropdown state uses explicit ARIA values and native button activation.

## Constants and assumptions

- Brand colors, typography, header markup and shared tokens are unchanged in this work.
- Standalone theme switch uses existing spacing values of `1rem`, a circular shape and a `0 4px 16px rgb(0 0 0 / 16%)` shadow.
- Booking content starts `10rem` below the fixed header. The direct-link text is limited to `75ch`. Parent visual inspection must confirm header clearance at both widths.
- MassageBook is cross-origin, so the parent page cannot guarantee or change vendor-internal theming. White and `color-scheme: light` intentionally preserve the existing provider presentation.
- Context7 returned its quota error. Official Astro view-transition and client-side-script documentation confirmed `newDocument`, before/after swap timing and guarded rerun behavior.

## Verification

- `node --check src/js/theme.js` passed.
- `node --check src/js/nav.js` passed.
- `node --test scripts/theme.test.mjs` passed all seven tests. Coverage includes explicit/system combinations, invalid preference, OS-following, denied storage, in-memory choice, duplicate-run listener guard, before/after swaps and cross-tab preference removal.
- Astro compiler syntax transform passed for both components, both layouts and booking.
- No build, browser run, screenshots, dependency changes or commits were made by this worker. Parent owns combined rendering verification.

## Parent acceptance scenarios

- Confirm light/dark toggle state and native controls before/after reload, client navigation and back/forward. Include saved opposite-to-OS choices, no storage choice and denied storage.
- Confirm SecondaryLayout switch is visible, focused and operable without covering gift-page content.
- At phone width, open the menu and press Escape with zero dropdowns. Check closed ARIA and returned focus. Reopen, follow an internal anchor and a route, then check that the new page has no body scroll lock.
- Verify booking header clearance, readable direct alternatives, named iframe and the provider's deliberate light presentation in both site themes.
