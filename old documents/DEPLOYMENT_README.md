# Honest News - Static Site Deployment

## 📁 Folder Structure

```
static-site/
├── index.html              # Homepage
├── how-it-works.html       # Process explanation
├── methodology.html        # Source selection & bias measurement
├── verify.html             # Signature verification tool
├── style.css               # Styles (to be created)
├── app.js                  # Frontend logic (to be created)
├── status.json             # Global metrics
├── articles/
│   └── 20251029/
│       ├── zelensky-kyiv-attack.json
│       └── [more articles].json
├── keys/
│   └── public_key.pem      # Ed25519 public key (to be generated)
└── DEPLOYMENT_README.md
```

## ✅ Completed Files

- ✅ index.html (homepage with beta form)
- ✅ how-it-works.html
- ✅ methodology.html
- ✅ verify.html (with signature verification)
- ✅ status.json (sample metrics)
- ✅ 1 sample article JSON

## 🔨 Still Needed

1. **CSS File** (`style.css`) - Style the pages
2. **JavaScript** (`app.js`) - Load articles dynamically, beta form handling
3. **More Sample Articles Manifesto** (need ~9 more for 10 total)
4. **Public Key** (`keys/public_key.pem`) - Ed25519 public key for verification
5. **Signature Files** (`.sig` files for each article)

## 🚀 Next Steps

1. Complete CSS styling
2. Add app.js for dynamic article loading
3. Generate Ed25519 key pair (private for signing, public for verification)
4. Create remaining sample articles
5. Sign all article JSONs with private key
6. Deploy to production server

## 📝 Notes

- This is **static smoketown** - no API calls yet
- All analyses are precomputed
- Verification happens client-side
- Beta form needs backend endpoint (can be simple email for now)

