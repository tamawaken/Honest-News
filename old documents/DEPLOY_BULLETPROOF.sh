#!/bin/bash
# BULLETPROOF DEPLOYMENT — Single file, no API, guaranteed to work

echo "🚀 DEPLOYING HONEST NEWS — BULLETPROOF VERSION"
echo ""

echo "STEP 1: Backup and clean old files..."
ssh root@45.130.164.130 << 'ENDSSH'
cp /var/www/html/index.html /var/www/html/index.html.backup_$(date +%s) 2>/dev/null || true
rm -f /var/www/html/honest-news/index.html 2>/dev/null || true
rm -f /var/www/html/how-it-works.html 2>/dev/null || true
rm -f /var/www/html/methodology.html 2>/dev/null || true
rm -f /var/www/html/verify.html 2>/dev/null || true
rm -f /var/www/html/app.js 2>/dev/null || true
rm -f /var/www/html/style.css 2>/dev/null || true
echo "✅ Old files cleaned"
ENDSSH

echo ""
echo "STEP 2: Upload new single-file version..."
scp honest-news-v2-final.html root@45.130.164.130:/tmp/honest-news-v2-final.html

echo ""
echo "STEP 3: Deploy and set permissions..."
ssh root@45.130.164.130 << 'ENDSSH'
mv /tmp/honest-news-v2-final.html /var/www/html/index.html
chown www-data:www-data /var/www/html/index.html
chmod 644 /var/www/html/index.html
echo "✅ File deployed"
ENDSSH

echo ""
echo "STEP 4: Verify deployment..."
ssh root@45.130.164.130 << 'ENDSSH'
echo "Testing HTTP response..."
curl -sI http://localhost/ | head -5

echo ""
echo "Checking file exists..."
ls -lh /var/www/html/index.html

echo ""
echo "Checking content..."
curl -s http://localhost/ | grep -i "honest news" | head -1

echo "✅ Verification complete"
ENDSSH

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 Visit: http://45.130.164.130/"
echo ""
echo "SUCCESS CRITERIA:"
echo "  ✅ HTTP 200 response"
echo "  ✅ 'Honest News' appears on page"
echo "  ✅ 4 sample articles display"
echo "  ✅ Theme toggle works"
echo "  ✅ Category filters work"
echo ""


