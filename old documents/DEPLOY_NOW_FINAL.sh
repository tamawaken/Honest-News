#!/bin/bash
# Deploy Honest News — Gradient Hero Version

echo "🚀 Deploying Honest News (Gradient Hero) to server..."
echo ""

cd "$(dirname "$0")"

# Create tarball
echo "📦 Creating deployment package..."
tar -czf /tmp/honest-news-final.tar.gz \
  index.html how-it-works.html methodology.html verify.html \
  style.css app.js status.json articles/ \
  2>/dev/null

# Upload
echo "📤 Uploading files..."
scp /tmp/honest-news-final.tar.gz root@45.130.164.130:/tmp/

# Extract on server
echo "📦 Extracting on server..."
ssh root@45.130.164.130 << 'ENDSSH'
cd /var/www/html
tar -xzf /tmp/honest-news-final.tar.gz 2>/dev/null
rm /tmp/honest-news-final.tar.gz
chown -R www-data:www-data *.html *.css *.js status.json articles/
find . -type f -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" | xargs chmod 644
find . -type d | xargs chmod 755
echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "✅ Honest News deployed!"
echo "🌐 Visit: http://45.130.164.130/"
echo ""


