# Verification Keys Folder

This directory stores public verification assets used by the frontend.

## Required file

- `public_key.b64` - Base64-encoded Ed25519 public key used by `verify.html` and `app.js`.

## Related required assets

- Each article JSON should have a corresponding signature file with the same basename and `.sig` extension.
- Example:
  - `articles/20251029/example-story.json`
  - `articles/20251029/example-story.sig`

If these files are missing, verification UI will show a readable warning instead of failing silently.
