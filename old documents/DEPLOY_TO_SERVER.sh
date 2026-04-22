#!/bin/bash
# Deploy Honest News Static Site to Server

set -e  # Exit on error

SERVER="root@45.130.164.130"
DEST="/var/www/html/honest-news"

echo "🚀 Deploying Honest News Static Site..."
echo ""

# Create tarball of all files
echo "📦 Creating deployment package..."
cd "$(dirname "$0")"
tar -czf /tmp/honest-news-deploy.tar.gz \
    index.html \
    how-it-works.html \
    methodology.html \
    verify.html \
    style.css \
    app.js \
    status.json \
    articles/

# Upload to server
echo "📤 Uploading files to server..."
scp /tmp/honest-news-deploy.tar.gz ${SERVER}:/tmp/

# Extract and set permissions
echo "📦 Extracting files on server..."
ssh ${SERVER} << 'ENDSSH'
    mkdir -p /var/www/html/honest-news
    cd /var/www/html/honest-news
    tar -xzf /tmp/honest-news-deploy.tar.gz
    rm /tmp/honest-news-deploy.tar.gz
    chown -R www-data:www-data /var/www/html/honest-news
    find /var/www/html/honest-news -type f -exec chmod 644 {} \;
    find /var/www/html/honest-news -type d -exec chmod 755 {} \;
    echo "✅ Files deployed successfully!"
ENDSSH

# Clean up local tarball
rm /tmp/honest-news-deploy.tar.gz

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: http://45.130.164.130/honest-news/"
echo ""
echo "Note: Make sure Nginx/Apache is configured to serve this directory."

