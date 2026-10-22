# Dark-mode architecture notes

Read-only source audit, 2026-10-22. Scope covers the global styles, both layouts, theme toggle, header, footer, navigation, and shared action styles. No application files or constants changed. Light mode must remain unchanged by any later dark-mode repair.

## Verified cascade

- Both layouts import `root.less`, `dark.less`, then `global.css`. See `src/layouts/BaseLayout.astro:8-10` and `src/layouts/SecondaryLayout.astro:8-10`.
- LESS uses `body.dark-mode`. Its shared text fallback targets only paragraphs, list items, and headings. See `src/styles/dark.less:17-38`. Anchors, buttons, spans, and inherited body text are not covered by that fallback.
- Tailwind is imported with `important`, and there is no custom dark variant. See `src/styles/global.css:1-6`. The emitted CSS confirms that utilities use `!important` and `dark:` still means `@media (prefers-color-scheme:dark)`, not `body.dark-mode`. Inspected `dist/_astro/about.DBSSeN5e.css`; this is corroborating build output, not a new build or browser test.
- Component ID selectors and Astro scope attributes outweigh `body.dark-mode p` and the other broad element selectors. Important utilities outweigh normal LESS declarations regardless of selector specificity. A later global element override cannot reliably repair these two cases.

## Findings

### P1. Footer content remains black on its dark background

`src/components/Footer.astro:270-296` sets list items, links, and section headings to black through `#footer` selectors. `src/components/Footer.astro:327-350` also sets the credit wrapper to black. The only footer dark override changes its background to `#061623`, at `src/components/Footer.astro:471-477`. The higher-specificity footer rules beat the broad white-text rule in `src/styles/dark.less:26-38`.

Black on `#061623` is about **1.15:1** before the list-item opacity makes it slightly worse. Footer navigation, service names, contact links, headings, copyright, and non-link credit text fail WCAG 1.4.3. The `Follow Us` heading separately carries an important `text-black` utility at `src/components/Footer.astro:35`.

Later fix: override the actual footer text and link tokens or selectors only within dark mode. Do not change the footer's light colors as a side effect.

### P1. Shared navigation and buttons fail text contrast in both themes

Desktop links receive `lg:text-(--bodyTextColorWhite)` unconditionally, including the same value again under `lg:dark:`. See `src/components/Header.astro:155`, `src/components/Header.astro:163-185`. Since utilities are important, these override the intended black desktop text at `src/components/Header.astro:972-980`. The header gradient remains pink in both modes, at `src/components/Header.astro:909-915`, with no dark background override. Near-white text has about **2.06:1 to 3.90:1** contrast against the specified gradient stops, below the 4.5:1 normal-text threshold.

The header booking button is 16px bold through `src/styles/root.less:87-100`, with near-white text applied at `src/components/Header.astro:362-364` and `src/components/Header.astro:856-858`. It is about **3.90:1** on `--primary`. Shared `.rounded-button` uses the same light text at `src/styles/root.less:131-136`. The shared hover treatment is white on `#ff66ad`, about **2.71:1**, at `src/styles/root.less:107-128`. Shared CTA uses the same failing foreground/background pairing at `src/components/CTA.astro:23-26`.

These are existing light-mode issues as well as dark-mode issues, WCAG 1.4.3. Record them separately from any dark-only repair. Do not silently redesign light mode to resolve them.

### P1. Toggle announces the wrong state after restoring dark mode

The button always starts with `aria-pressed="false"` at `src/components/DarkModeToggle.astro:1`. Layout initialization changes the body class but never updates the attribute, at `src/layouts/BaseLayout.astro:130-164` and `src/layouts/SecondaryLayout.astro:86-120`. The click handler inverts the old ARIA value independently of the resolved theme at `src/components/DarkModeToggle.astro:25-37`.

A saved or OS-selected dark theme therefore announces unpressed. The next click switches to light but announces pressed. Client navigation replaces the button with the same false initial attribute. This is a WCAG 4.1.2 state mismatch. Parent browser checks confirmed dark/false and light/true; normal theme persistence through Astro navigation works.

Later fix: derive `aria-pressed` from the resolved dark-state boolean during initialization, navigation, and clicks. Keep the button's native semantics and accessible name.

### P2. Manual and system theme selectors disagree

The toggle only changes `body.dark-mode`, at `src/components/DarkModeToggle.astro:34-37`. Tailwind `dark:` still follows the OS because `src/styles/global.css:1-6` does not override its variant. Live shared examples are the announcement gradient at `src/components/Header.astro:24-28` and the logo filter utility at `src/components/Header.astro:124`.

With a light OS preference, choosing dark changes LESS but leaves Tailwind in light mode. With a dark OS preference, choosing light leaves Tailwind dark utilities enabled. The logo has another conflict: its manual dark filter at `src/components/Header.astro:587-590` and `src/components/Header.astro:1015-1018` loses to important `dark:grayscale-0` only when the OS is dark. Appearance depends on both saved choice and OS rather than one resolved theme.

Later fix: make Tailwind's dark variant follow the same selector as LESS. Preserve unprefixed utilities and light declarations.

### P2. Dark overrides do not update the tokens used by most shared text

Dark mode changes `--bodyText` and `--clr-primary` at `src/styles/dark.less:17-24`. `--bodyText` is correctly consumed by Tailwind `text-(--bodyText)` utilities at `src/components/Review.astro:77`, `src/components/Review.astro:82`, and `src/components/Review.astro:84`; the emitted CSS and parent browser checks confirm white review-card text in dark mode. Preserve that working mapping. `--clr-primary` appears unused.

Other shared text reads `--bodyTextColor` and `--headerColor`, at `src/styles/root.less:69-83`, `src/styles/root.less:240-246`, and `src/styles/root.less:268-275`. Both remain light-theme values from `src/styles/root.less:22-26`. The broad white-element rule partially hides the mismatch. ID-scoped text and important utilities using those tokens keep the dark light-theme values. This explains why page-level dark text cannot be fixed by source order alone. Parent page audit owns the specific affected page list.

Later fix: override the missing semantic tokens within dark mode, then check component exceptions. Keep the working `--bodyText` review-card mapping. Avoid adding another parallel set of unused tokens.

### P2. Initialization pins the OS fallback and assumes storage works

Both layouts choose storage first, then sample the OS once, then call a helper that always writes the chosen value to storage. See `src/layouts/BaseLayout.astro:132-159` and `src/layouts/SecondaryLayout.astro:88-115`. A first-time OS preference becomes an explicit saved choice without a click. There is no media-query change listener or way to return to system mode.

All storage reads and writes are unguarded in those blocks and `src/components/DarkModeToggle.astro:37`. A denied read aborts setup before the OS fallback and before the navigation listener is registered. Parent browser checks confirmed the exception and light appearance with denied storage.

Later fix: separate applying a theme from saving an explicit choice. Fall back to an in-memory choice when storage is unavailable. If system-following behavior is retained, listen for OS changes only while no explicit choice exists.

### P2. SecondaryLayout applies a saved theme but provides no switch

`src/layouts/SecondaryLayout.astro:70-82` comments out the shared header and other shared controls, yet retains the automatic theme setup at `src/layouts/SecondaryLayout.astro:86-120`. The gift-certificate route uses that layout at `src/pages/giftcertificate.astro:15-21`. On direct entry, a visitor can receive dark mode but has no theme toggle on that page.

It also imports `nav.js` at `src/layouts/SecondaryLayout.astro:61-62` despite having no menu. `src/js/nav.js:7-19` dereferences the absent menu toggle without a guard. That handler throws on this layout. This is separate from theme persistence; do not report it as navigation losing the theme.

Later fix: keep one shared theme initialization path and provide an accessible switch where automatic theming applies. Do not run header navigation setup on a layout without a header.

### P2. Shared skip link never becomes visible on keyboard focus

Both layouts include a native skip link, at `src/layouts/BaseLayout.astro:109-112` and `src/layouts/SecondaryLayout.astro:65-68`. `src/styles/root.less:298-305` leaves it at `opacity:0` and a large negative z-index, with no focus override anywhere in `src`. Keyboard users focus an invisible control in both themes, a WCAG 2.4.7 failure.

Later fix: reveal the existing skip link on `:focus-visible` with sufficient stacking and contrast. Keep its destination and light-mode layout unchanged.

## Preserve and do not overclaim

- Storage wins over the OS, and `astro:after-swap` reapplies the theme. See `src/layouts/BaseLayout.astro:147-164` and `src/components/DarkModeToggle.astro:43-45`. Parent browser checks confirmed theme persistence across client navigation. No lost-theme navigation defect is claimed.
- The native toggle is 48 by 48 CSS pixels at `src/styles/root.less:338-340`. Do not replace it with a non-button control.
- The header marquee already disables its animation under reduced motion, at `src/components/Header.astro:1065-1070`.
- `src/data/navData.json:1-43` has no dropdown children. The white-on-white desktop dropdown branch and keyboard ARIA toggling defects in `nav.js` are latent, not counted as live user failures.
- Theme setup runs after the document markup, at `src/layouts/BaseLayout.astro:130-165` and `src/layouts/SecondaryLayout.astro:86-121`. This is a first-paint risk, not a reproduced flash in this source audit.

## Method and next pass

Contrast ratios use WCAG relative luminance and the explicit opaque sRGB colors in source. Gradient values are sampled at the declared stops. Browser-computed opacity, blending, and responsive checks belong to the parent's runtime report. No full-site health score is assigned to this narrower architecture audit.

The bundled Impeccable detector was run read-only on the scoped files. It returned 20 warnings and 19 advisories, mostly font/palette heuristics and width-transition notices. Those are not 39 verified defects. The Poppins warnings conflict with DESIGN.md's explicit navigation-font prose, and one points to a commented import. Font popularity is not a dark-mode defect. Detector contrast omissions do not override the verified cascade findings above.

Recommended order for a later approved repair: `$impeccable harden` for resolved theme state and lifecycle, `$impeccable colorize` for dark-only token and contrast fixes, `$impeccable audit` to verify manual/system choices and desktop/mobile behavior, then `$impeccable polish`. Preserve a light-mode baseline throughout.

Tailwind behavior was checked against current documentation: <https://tailwindcss.com/docs/dark-mode>.
