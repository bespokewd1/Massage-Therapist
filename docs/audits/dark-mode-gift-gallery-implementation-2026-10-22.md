# Gift certificate and gallery repairs

Date: 2026-10-22

## Changed

- `src/pages/giftcertificate.astro` retains the current section layout, imagery, and standalone SecondaryLayout. Corrected its mismatched closing layout tag and removed unused imports.
- Both placeholder Buy links now call the existing `client.phoneForTel` number. Their label is "Call about gift certificates". Instructions now ask clients to discuss options, pricing, terms, and purchase details by phone. Removed PayPal, instant purchase, and unconfirmed duration claims. No checkout or payment policy was added.
- Existing certificate artwork remains. Added a visible reference-only note and descriptive image text asking visitors to confirm current details by phone.
- Hero and bottom CTA labels explicitly use the shared `--on-action`, `--action-bg`, and `--action-hover` roles. Their longer phone label can wrap without fixed-height clipping. Bottom CTA hover uses transform instead of animated width.
- Added a black hero scrim at 0.72 opacity so light text does not depend on the photograph. Removed persistent background-position will-change and the forced compositing transform. Reduced motion changes the fixed hero background to scroll and removes CTA-fill movement.
- Local information accents use `--accent-text`. Step numbers no longer have low-opacity text. The dark steps panel uses `--surface`; the existing beige light panel remains.
- `src/pages/gallery.astro` changes only the small photo count from fixed `#b54d7f` to shared `--accent-text`. Tabs, viewer behavior, photos, composition, and reduced-motion handling remain unchanged.

## Verification

- Project-native Node checks passed for both files. `@astrojs/compiler` transform returned zero diagnostics. Both local LESS blocks compiled with the installed `less` package.
- `git diff --check` passed for both files.
- Source checks found no remaining `href="#"`, PayPal, instant-purchase text, or will-change in the gift page. Both phone actions derive their number from the existing client data and trim its leading whitespace.
- Fixed-pair contrast calculations: white on shared action `#d20b68` is 5.27:1; hover `#ae0955` is 7.07:1. Gallery accent `#b80d64` on white is 6.40:1 and on `#fff7fb` is 6.08:1. Dark accent `#f984ef` on `#12110f` is 8.60:1. Hero `#fafbfc` on the conservative white-photo-plus-scrim composite `#474747` is 8.97:1; its existing pink topper is 5.15:1.
- No build, browser inspection, screenshot, or dependency installation was run by this worker. Parent owns the combined route and interaction checks, including actual composited backgrounds and responsive label fit.

## Assumptions and unresolved items

- The existing client phone number is the available inquiry channel. No claim is made that payment is taken by phone.
- Gift certificate pricing, payment flow, validity, and delivery remain unconfirmed. The unchanged `100gc.png` and `200gc.png` art contains old pricing/expiry details. Updated approved art is still needed; the new reference note does not establish current prices or terms.
- Existing unrelated dermatologist photography and latent template styles were left outside this narrow repair. No gallery assets or nested routes were changed.
- Shared tokens, theme switch/state handling, review text, and global focus treatment are owned by the parent/other workers. No shared CSS values were changed here.
