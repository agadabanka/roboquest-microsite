#!/bin/bash

# RoboQuest Microsite - Automated Netlify Deployment
# Run this after GitHub CLI authentication is complete

echo "🚀 RoboQuest Microsite - Automated Deployment to Netlify"
echo "========================================================"

# Check if GitHub CLI is authenticated
if ! gh auth status >/dev/null 2>&1; then
    echo "❌ GitHub CLI not authenticated. Please run:"
    echo "   gh auth login --web"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ GitHub CLI authenticated"

# Create GitHub repository
echo "📝 Creating GitHub repository..."
REPO_NAME="roboquest-microsite"
REPO_DESC="Marketing microsite for RoboQuest - Astro Bot-style indie mobile 3D platformer"

if gh repo create "$REPO_NAME" --public --description "$REPO_DESC"; then
    echo "✅ GitHub repository created: $REPO_NAME"
else
    echo "⚠️ Repository might already exist, continuing..."
fi

# Add remote and push
echo "📤 Pushing code to GitHub..."
git remote remove origin 2>/dev/null || true
gh repo set-default

if git push --set-upstream origin main; then
    echo "✅ Code pushed to GitHub successfully"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Get repository URL
REPO_URL=$(gh repo view --json url -q .url)
echo "📍 Repository URL: $REPO_URL"

echo ""
echo "🌐 NETLIFY DEPLOYMENT INSTRUCTIONS:"
echo "=================================="
echo "1. Go to netlify.com and sign in with GitHub"
echo "2. Click 'Add new site' → 'Import an existing project'"
echo "3. Choose 'Deploy with GitHub'"
echo "4. Select repository: $REPO_NAME"
echo "5. Build settings:"
echo "   - Branch: main"
echo "   - Build command: (leave empty)"
echo "   - Publish directory: ."
echo "6. Click 'Deploy site'"
echo ""
echo "🎯 Your microsite will be live in 1-2 minutes!"
echo "📱 Test URL will be: https://random-name.netlify.app"
echo "🔧 You can customize the subdomain in Netlify settings"
echo ""
echo "✅ DEPLOYMENT READY!"
echo "🚀 Next: Visit netlify.com to complete the deployment"