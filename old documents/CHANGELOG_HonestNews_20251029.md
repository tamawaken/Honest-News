# CHANGELOG_HonestNews_20251029

## Summary
Complete UI overhaul integrating CarlOS V2 layout with Honest News data, neutralizing metric labels, adding robust theme toggle, category filtering, and subpath-safe loading.

## Changes

### Visual
- Extracted layout/spacing from `CarlOSV2News.html`
- Unified sidebar + main grid layout
- Category filter chips (ALL, TECH, AI, SPACE, CRYPTO, CLIMATE, HEALTH, ENERGY, POLITICS)
- Sticky header with backdrop blur
- Gradient branding and accents
- Responsive at 1200/992/768/414px

### Metrics (Neutralized)
- **Consciousness** → **Signal Coherence (SC%)** = `phi_link * (1 - manipulation_score) * 100`
- **Qualia Response** → **Emotional Intensity Index (EII%)** = `emotion_score * 100`
- **Ω Balance φ** → **Harmonic Balance (φ-HB)** = `phi_link` (with φ suffix)
- **Swarm Harmony** → **Consensus Harmony (CH%)** = `(active_traits/1000) * (1 - bias_score) * 100`

### Features
- Subpath-safe loading: works at `/` and `/honest-news/` via `URL()` resolver
- Theme toggle: localStorage + `prefers-color-scheme` + CSS vars
- Category filtering: hash-based routing `#cat=<slug>`
- Data adapter: maps Honest News JSON to neutralized metrics
- Ed25519 verification: `verifyArticle()` using tweetnacl
- Missing data handling: renders `—` for null values

### Files Modified
- `index.html` - Complete rewrite with V2 layout
- `style.css` - Unified styling with light/dark themes
- `app.js` - Adapter pattern, BASE resolver, filtering, theme

## Testing

### Manual Tests
```bash
# 1. Open browser
# 2. Navigate to http://45.130.164.130/
# 3. Open DevTools Console + Network
# 4. Verify:
```

**Theme Toggle:**
- Click 🌙 → switches to light theme
- Reload page → theme persists
- Check localStorage `hn-theme`

**Category Filters:**
- Click "TECH" → filters to tech articles
- URL updates to `#cat=tech`
- Click "ALL NEWS" → shows all
- Direct load `#cat=climate` → filters correctly

**Metrics Display:**
- All 4 metrics shown per card
- Missing values show `—`
- Progress bars animate on load
- Thoughts section shows 4 items

**Verification:**
- Click "Verify" on any card
- Should see ✅ or ❌ alert
- Check Network tab for JSON/sig/key fetches

**Subpath Safety:**
- Works at root `/`
- Works at `/honest-news/` (if mounted)
- No absolute paths (`/status.json` → `urlOf('status.json')`)

### Console Checks
- No errors on load
- Network tab: 200 OK for status.json, manifest.json
- localStorage: `hn-theme` key present after toggle

### Lighthouse
```bash
# Open Chrome DevTools → Lighthouse → Run
# Target: Accessibility ≥ 90, Performance ≥ 80
```

## Rollback

If issues occur:
```bash
cd ~/Documents/BOONQEC_ORGANIZED/"CarlOS Honest News/static-site"
git checkout HEAD index.html style.css app.js  # If using git
# OR restore from backup:
cp index.html.backup index.html
cp style.css.backup style.css
cp app.js.backup app.js
```

## Deployment

Already deployed via previous tarball/SCP process. Files live at:
- `/var/www/html/index.html`
- `/var/www/html/style.css`
- `/var/www/html/app.js`

## Notes

- No backend changes required
- Honest News branding maintained
- All metrics are computed client-side
- Ed25519 verification optional (graceful failure)
- Category tags lowercased for matching


