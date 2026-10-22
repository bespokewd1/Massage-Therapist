# Dark-mode repair scope and decisions

Date: 2026-10-22

Approved work follows the prior audit: harden and color repairs in parallel, motion/clarity/confirmed CSS cleanup with each owner, then combined audit and bounded polish.

- Keep the existing light layout, photos, Open Sans/Poppins typography and brand pink #f3117e / orchid #f984ef.
- Use body.dark-mode as the single activation selector for LESS and Tailwind; no second dark flag.
- Add semantic page/panel/text/action roles rather than another unconsumed palette.
- The action-specific fill changes from #f3117e to #d20b68 with white text. Hover uses #ae0955. Brand pink itself is unchanged. This fixes the existing normal-size action-label contrast in both themes.
- Dark page #12110f, panels #211c18 / #302720, primary text #f5f1ed, muted text #cfc5bd, border #806c60. Light body/heading values remain; paired service/review surfaces become opaque to remove photo-dependent contrast.
- Confirmed old identity text can become Stone Massage / Cecilia Batu. Approved testimonial text/names remain unchanged.
- Contact clinic booking uses the confirmed MassageBook URL, while mobile booking remains by phone.
- Gift certificate checkout is undecided. Replace misleading online-purchase links/PayPal promises with a phone inquiry, without claiming that payment/delivery has been implemented.
- No new checkout, pricing, expiry/validity policy, legal documents, social destinations or business facts.
- Do not delete public template routes or substitute clinic photos without approval/assets. List remaining artwork/template-image decisions at handoff.
- Consolidate duplicated booking popup markup into the shared native dialog. Its current booking choices stay the same; native focus management and Escape replace hidden overlay toggling.
- Remove dead copied CSS only where active markup/reference checks establish it is unused. No dependency cleanup or install.
- Bounded verification: one combined desktop/phone light/dark inspection, one fixes batch, at most one confirmation. No open-ended polish loop.
