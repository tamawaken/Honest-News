# The News Meta

The News Meta is a transparency-first news analysis demo that compares how topics are framed across outlets. It combines category-based browsing, source-selection controls, and integrity verification tooling in a fast static frontend.

## What This Demo Shows

- Multi-category news cards (`tech`, `ai`, `space`, `crypto`, `climate`, `health`, `energy`, `politics`)
- Reader-selectable source inclusion for processing/display
- Pipeline scaffold for provider ingestion, clustering, linguistic analysis, factual core extraction, and meta-article assembly (`pipeline/`)
- Signed output handoff into Ed25519-compatible article artifacts
- Reader-facing methodology, editorial policy, and corrections pages
- Browser-side verification flow for signed analysis artifacts (when key/signature files are present)

## Project Structure

- `index.html` - main feed UI
- `app.js` - rendering, filtering, source selection, modal behavior
- `style.css` - responsive styling and accessibility-focused UI patterns
- `articles/` - manifest and article JSON data used by the demo
- `verify.html` - file integrity verification UI
- `methodology.html` - analysis process and limitations
- `editorial-policy.html` - publishing standards
- `corrections.html` - correction policy and change log
- `about.html` - ownership, mission, accountability
- `publish-checklist.html` - deployment QA checklist
- `keys/README.md` - required verification key/signature expectations
- `old documents/` - archived internal and historical files
- `pipeline/` - staged processing pipeline scaffold (provider adapters, API/LLM placeholders, deterministic logic, signing handoff)

## Run Locally

This is a static site. Serve the directory with any local HTTP server.

Example:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

## Pipeline + Signing

Generate local pipeline output:

```bash
node "./pipeline/run-local.mjs"
```

Generate and hand off signed article output:

```bash
TNM_HANDOFF_SIGN=1 node "./pipeline/run-local.mjs"
```

## Verification Notes

Verification features require:

- `keys/public_key.b64`
- matching `.sig` files for each article JSON

Without those assets, the UI shows a readable warning and continues functioning.

## Quality and UX Focus

- Mobile-first responsive layout with long-headline wrapping
- Keyboard-visible focus states and skip links
- Explicit trust/policy pages for accountability and credibility
- Practical, non-speculative copy designed for real-world demos

## License

Add your preferred license before public production use.
