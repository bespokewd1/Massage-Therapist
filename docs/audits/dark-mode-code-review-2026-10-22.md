# Dark-mode code review

Date: 2026-10-22

## Scope and method

Read-only application review of the dark-mode repair diff, `docs/audits/dark-mode-repair-decisions.md`, and the implementation notes. Reviewed the shared theme controller and initializer, theme tests, layouts, navigation, native booking dialog, sticky controls, observer cleanup, semantic tokens, and changed page/component styles.

No build, tests, browser, detector, screenshots, dependency installation, or application edits were run by this reviewer. Parent owns the bounded runtime checks. Existing template imagery and documented business-fact gaps are outside this review. No constants changed.

## Remaining actionable regression

### P2. Clicking Close hides the dialog opener before native focus restoration

- Location: `src/js/nav.js:38-39`, with the sibling dialog at `src/components/Header.astro:232-235` and its Close form at `src/components/Header.astro:255-260`.
- Reproduction path: at phone width, expand the navigation, activate its Book Online button, then activate the dialog's Close button.
- Source evidence: the booking dialog is outside `#cs-navigation`. Its button click bubbles to the delegated navigation handler, which treats it as an outside-menu click and calls `setMenu(false)`. That hides `.cs-ul-wrapper` before the form's `method="dialog"` default action closes the dialog. The original Book Online button is inside that hidden wrapper, so native dialog closure cannot return keyboard focus to the opener. This path differs from Escape, which the new modal guard now leaves to the native dialog.
- User impact: keyboard users lose their position after dismissing the booking chooser with its visible Close control. The menu unexpectedly closes behind that control as well.
- Fix: exclude open-dialog content from the delegated outside-menu click branch. Alternatively close the menu before opening the dialog and explicitly choose a visible focus-return control. Keep the native Close form and Escape behavior.

## Resolved during the parent fixes batch

- The navigation Escape handler previously prevented the native booking dialog from closing while the mobile menu remained expanded. `src/js/nav.js:45` now returns while a dialog is open. Source inspection confirms the conflicting `preventDefault()` is no longer reached on that path. Parent owns runtime confirmation.
- Disabled pagination arrows initially put `aria-label` on a bare span. `src/components/React/Pagination.tsx:37-43` now gives that nonfocusable element `role="link"` and `aria-disabled="true"`. Parent found and fixed this during its accessibility check.
- Parent moved the footer logo's white dark-mode backing onto `.logo img` at `src/components/Footer.astro:497-499`. No separate visual judgment was performed by this reviewer.

## Resolved by parent after review

Parent added an early return for `event.target.closest?.('dialog[open]')` at the start of the delegated click handler in `src/js/nav.js:25`. Source inspection confirms dialog clicks now bypass the outside-menu branch, resolving the remaining Close/focus-restoration finding above within the same fixes batch. No unresolved verified regression remains from this review. Parent owns final runtime confirmation.

No other verified introduced regression was found in the reviewed theme lifecycle, semantic-token changes, or observer cleanup. This is a bounded source review, not a rendered accessibility certification.

## Parent disposition

The parent added the same native-dialog precedence to delegated clicks before the completed confirmation run. The handler now returns for `event.target.closest?.('dialog[open]')`, so Close cannot hide the menu/opener before the browser restores focus. Escape and Close focus restoration are both included in final browser confirmation. The earlier in-flight confirmation was stopped before inspection to include this source-review finding in the fixes batch. No further review or polish loop was run.
