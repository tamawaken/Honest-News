# 🐛 Bug Report & Code Review — Honest News Static Site

## ✅ **CRITICAL ISSUES** (Must Fix Before Deploy):

### 1. **CSS DUPLICATE: Input Styles Defined Twice** ⚠️
**Location:** `style.css` lines 221-224 AND 332-342
- **Problem:** `.input, input, textarea, select` is defined twice with different styles
- **Impact:** Second definition (332-342) overrides first, but first has hardcoded colors
- **Fix:** Remove lines 221-224 (hardcoded version), keep CSS variable version (332-342)

### 2. **Verify Page: Key Format Mismatch** ⚠️
**Location:** `verify.html` line 38
- **Problem:** Uses `/keys/public_key.pem` but sign script creates `/keys/public_key.b64`
- **Problem:** PEM parsing code won't work with base64 format
- **Impact:** Verification will fail on verify.html page
- **Fix:** Change default to `/keys/public_key.b64` and update parsing logic to match `app.js`

### 3. **Inconsistent Header Styling** ⚠️
**Location:** All HTML files
- **Problem:** `index.html` uses `class="header site-header"` but other pages use just `class="header"`
- **Impact:** Other pages won't get sticky header behavior
- **Fix:** Add `site-header` class to all header elements

### 4. **Inconsistent Footer Styling** ⚠️
**Location:** All HTML files
- **Problem:** `index.html` uses `class="site-footer"` with proper structure, others use `class="footer"`
- **Impact:** Inconsistent styling across pages
- **Fix:** Update all footers to match index.html structure

---

## ⚠️ **MEDIUM PRIORITY ISSUES**:

### 5. **Missing Theme Toggle on Other Pages**
**Location:** `how-it-works.html`, `methodology.html`, `verify.html`
- **Problem:** No theme toggle button in navigation
- **Impact:** Users can't switch themes on sub-pages
- **Fix:** Add theme toggle button to all nav sections

### 6. **Missing data-theme Attribute**
**Location:** Other HTML pages
- **Problem:** Only `index.html` has `data-theme="dark"` on `<html>` tag
- **Impact:** Theme won't initialize correctly on other pages
- **Fix:** Add `data-theme="dark"` to all HTML tags

### 7. **Missing Container Structure**
**Location:** `how-it-works.html`, `methodology.html`, `verify.html`
- **Problem:** Header/footer don't use `container` class structure
- **Impact:** Inconsistent spacing and alignment
- **Fix:** Add proper container divs to match index.html

### 8. **Hardcoded Colors Instead of CSS Variables**
**Location:** `style.css`
- **Lines to fix:**
  - Line 172: `.metric .k{color:#89a0bf}` → use `var(--muted)`
  - Line 174: `.metric .sub{color:#8aa2c2}` → use `var(--muted)`
  - Line 212: `.article-meta{color:#99b1d5}` → use `var(--muted)`
  - Line 216: `.badge{color:#bfeaff}` → use CSS variable
  - Line 229: `.code{background:#0f1722}` → use `var(--card-2)`
  - Line 229: `.code{border:1px solid #23324a}` → use `var(--line)`
  - Line 229: `.code{color:#cfe3ff}` → use `var(--ink)`
  - Line 231: `.kv div:nth-child(odd){color:#9ab2d2}` → use `var(--muted)`

---

## 🔍 **MINOR ISSUES**:

### 9. **API Path Consistency**
**Status:** ✅ OK - Absolute paths (`/status.json`) will work correctly

### 10. **Manifest JSON Structure**
**Status:** ✅ OK - Flat array structure is correct

### 11. **Article JSON Structure**
**Status:** ✅ OK - All required fields present

---

## 📋 **SUMMARY OF FIXES NEEDED**:

### High Priority:
1. ✅ Remove duplicate CSS input styles (lines 221-224)
2. ✅ Fix verify.html key format and parsing
3. ✅ Add `site-header` class to all headers
4. ✅ Update all footers to match index.html

### Medium Priority:
5. ✅ Add theme toggle to all pages
6. ✅ Add `data-theme="dark"` to all HTML tags
7. ✅ Add container structure to other pages
8. ✅ Replace hardcoded colors with CSS variables

---

## 🎯 **TOTAL ISSUES FOUND:**
- **Critical:** 4
- **Medium:** 4
- **Minor:** 0
- **Total:** 8 issues to fix

**Ready to fix?** All are straightforward updates that won't break existing functionality.

