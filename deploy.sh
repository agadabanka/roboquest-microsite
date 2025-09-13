#!/bin/bash

# RoboQuest Microsite Deployment Script
# Based on hosting research recommendations

echo "🎮 RoboQuest Microsite Deployment Helper"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Run this script from the microsite root directory"
    exit 1
fi

echo "📋 Deployment Options:"
echo "1. SiteGround (Recommended - $3.99/month)"
echo "2. Netlify (Simple - Free tier available)"
echo "3. GitHub Pages (Free)"
echo ""

read -p "Select deployment option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🏗️ SiteGround Deployment Instructions:"
        echo "======================================"
        echo "1. Sign up at siteground.com"
        echo "2. Choose StartUp plan ($3.99/month)"
        echo "3. Register domain or use existing one"
        echo "4. Access File Manager in cPanel"
        echo "5. Upload all files to public_html directory"
        echo "6. Set up Cloudflare CDN (free tier)"
        echo ""
        echo "📁 Files to upload:"
        find . -type f -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.png" -o -name "*.jpg" -o -name "*.mp4" | head -20
        echo ""
        echo "🚀 After upload, your site will be live at your domain!"
        ;;
    2)
        echo ""
        echo "🌐 Netlify Deployment Instructions:"
        echo "=================================="
        echo "1. Create GitHub repository for your microsite"
        echo "2. Push all files to the repository"
        echo "3. Sign up at netlify.com"
        echo "4. Connect your GitHub repository"
        echo "5. Configure build settings (static site)"
        echo "6. Custom domain and SSL automatically managed"
        echo ""
        echo "🔄 Auto-deployment: Any changes to GitHub auto-deploy to Netlify"
        echo ""
        # Create .netlify configuration
        cat > netlify.toml << EOF
[build]
  publish = "."
  
[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
EOF
        echo "✅ Created netlify.toml configuration file"
        ;;
    3)
        echo ""
        echo "📚 GitHub Pages Deployment Instructions:"
        echo "======================================="
        echo "1. Create new GitHub repository"
        echo "2. Push all files to main branch"
        echo "3. Go to repository Settings > Pages"
        echo "4. Select 'Deploy from branch' source"
        echo "5. Choose 'main' branch and '/ (root)' folder"
        echo "6. Your site will be available at username.github.io/repository-name"
        echo ""
        echo "🌐 Free hosting with GitHub domain"
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "📊 Pre-deployment Checklist:"
echo "============================="
echo "[ ] Replace placeholder images with actual game assets"
echo "[ ] Add game trailer video (assets/roboquest-trailer.mp4)"
echo "[ ] Create press kit materials"
echo "[ ] Configure analytics tracking codes"
echo "[ ] Test on mobile devices"
echo "[ ] Optimize images for web (compress for faster loading)"
echo "[ ] Set up social media accounts"
echo "[ ] Create custom domain (optional)"
echo ""
echo "🎯 Performance Targets (from research):"
echo "- Page load speed: <3 seconds on mobile"
echo "- Mobile responsiveness: 95+ PageSpeed score"
echo "- Conversion rate: 15-25% visitor to app store"
echo ""
echo "✅ Microsite ready for deployment!"
echo "🚀 Good luck with your indie game launch!"