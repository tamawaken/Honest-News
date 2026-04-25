# The News Meta Responsive QA Checklist

Use this checklist before each production push.

## Quick Run

- Start local server: `python3 -m http.server 8000`
- Open `http://localhost:8000`
- Verify console has no errors on initial load and after opening/closing the article modal.

## Breakpoint Pass

Check at minimum these viewport widths:

- Desktop: `1440px`
- Laptop: `1024px`
- Tablet: `768px`
- Mobile: `560px` and `390px`

At each width, verify:

- Header/nav remain aligned and readable.
- `in beta testing` label is visible.
- Category filters wrap cleanly without overlap.
- Source selector chips/actions remain usable.
- Cards maintain image crop quality and title/summary clamp.
- Read Coverage button contrast passes in dark and light themes.
- Modal opens, scrolls, and closes correctly.
- Keyboard flow works (`Tab`, `Shift+Tab`, `Esc`).

## Functional Spot Checks

- Category filtering works for all categories.
- Source selector:
  - `All` shows stories.
  - `None` shows empty state message.
  - Picking a subset filters stories correctly.
- Theme toggle persists between reloads.
- Verify page loads and handles missing files with user-facing error copy.

## Pipeline Spot Checks

- `node "./pipeline/run-local.mjs"`
- `TNM_HANDOFF_SIGN=1 node "./pipeline/run-local.mjs"`
- Confirm output files are generated locally (not committed by default).

## Final Pre-Push

- Run syntax checks:
  - `node --check "./app.js"`
  - `node --check "./pipeline/"*.mjs`
- Confirm no accidental secrets/artifacts are staged.
