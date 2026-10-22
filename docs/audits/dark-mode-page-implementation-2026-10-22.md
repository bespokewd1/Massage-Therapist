# Dark-mode page implementation

Date: 2026-10-22

## Files

- `src/pages/index.astro`
- `src/pages/mobile-massage.astro`
- `src/pages/contact.astro`
- `src/pages/about.astro`
- `src/pages/direct-billing.astro`

## Changes

- Paired the homepage and mobile-massage information panels with `--surface`, `--bodyTextColor`, and `--headerColor`. The light panel stays white; the shared dark token supplies the dark panel.
- Replaced contact's inline white booking cards with `.booking-card` styles using the same semantic roles. Kept the card layout and used the previous 254px height as a minimum so longer copy can fit. Changed the card titles/descriptions to `h3` and `p` under the page's existing section heading.
- Removed the two unnamed empty contact buttons. Book Online now links to the confirmed MassageBook destination, `https://www.massagebook.com/therapists/StoneMassage?src=external`. Mobile booking remains a phone link. Both contact action labels now stay 16px at phone and desktop widths.
- Removed the duplicate homepage/mobile booking popups. Header owns the shared booking choice. These pages' active booking links already navigate directly and did not need a popup trigger.
- Removed the homepage headline blink and its keyframes. Removed persistent `will-change: background-position` and `translate3d(0, 0, 0)` hints. Retained the existing desktop fixed-background effect, with `background-attachment: scroll` under reduced motion.
- Removed copied review-scroll handlers with no active target IDs and redundant JavaScript background offsets. The CSS fixed-background effect remains the single background behavior.
- Added a 65% black hero scrim on both hero photos and kept hero copy near-white. Added the same bounded scrim behind the homepage services section. Existing photos and layout remain.
- Gave photo captions an opaque `--service-surface` / `--service-text` pair. Removed conflicting white caption utilities. Page action labels now use `--on-action`; decorative action icons use the action foreground instead of fixed green.
- Corrected confirmed Healing Touch and Sarah Thompson remnants to Stone Massage and Cecilia Batu. Corrected Our Services links to `/#massage-services`. No approved claims or named testimonials changed.
- Removed unused imports/data, copied mobile selectors for absent sections, homepage gallery styles with no markup, and inactive contact-form markup/styles. Kept active photo styles and public routes.
- Corrected the trailing space in `direct-billing`'s ID and used `--accent-text` for its existing pink text so both themes use the tested text role.

## Constants and assumptions

- New local scrim constant: `rgba(0, 0, 0, 0.65)`. This bounds a white photo pixel to approximately `#595959` before text, giving `#fafbfc` copy about 6.7:1 contrast in the worst case.
- Caption colors come from the shared service tokens. No local palette or theme selector was added.
- `body.dark-mode` remains the sole CSS theme selector. The parent agent owns shared token values and actions.
- PRODUCT.md is the source for the business/person names and booking destinations. Address fields and existing clinic/property imagery remain unchanged pending business approval.

## Verification

- Ran the native installed Astro compiler transform on all five pages and rendered each page's LESS through the installed `less` package. All five passed with no fatal Astro diagnostics or LESS syntax errors.
- `git diff --check` passed for all five files.
- Source checks found no page `id="popup"`, blink, persistent rendering hints, old identity strings, `/services` href, or `#cs-form` leftovers in these files.
- No build, browser, screenshots, dependency installs, or commits were run by this worker. Combined build, contrast/state checks, and desktop/mobile visual verification belong to the parent's bounded QA pass.

## Remaining limits

- About still uses the existing property-template images, as requested. Their replacement needs approval and actual clinic assets.
- Browser-computed layout, photo composites, and shared booking-dialog behavior still need the parent's combined QA pass. No runtime accessibility or performance certification is claimed here.
