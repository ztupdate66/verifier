#!/bin/bash
set -e

echo "🚀 KonsoleH Email Verifier - Deployment Helper"
echo "=============================================="
echo ""

# Check if git remote exists
if ! git remote get-url origin &>/dev/null; then
    echo "⚠️  No GitHub remote found."
    echo ""
    echo "To deploy, you need to:"
    echo "1. Create a new repository on GitHub"
    echo "2. Add it as remote:"
    echo "   git remote add origin https://github.com/yourusername/konsoleh-verifier.git"
    echo "3. Push the code:"
    echo "   git push -u origin main"
    echo ""
    read -p "Do you want to set up GitHub remote now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your GitHub repo URL: " REPO_URL
        git remote add origin "$REPO_URL"
        echo "✅ Remote added. Now pushing..."
        git push -u origin main || git push -u origin master
        echo "✅ Code pushed to GitHub!"
    else
        echo "Please set up GitHub manually and re-run this script."
        exit 1
    fi
fi

echo ""
echo "📦 Your code is ready for deployment!"
echo ""
echo "Choose your deployment platform:"
echo ""
echo "1. Railway (Recommended - Easy, has persistent storage)"
echo "   → Go to: https://railway.app"
echo "   → Click: New Project → Deploy from GitHub repo"
echo "   → Select your repo"
echo "   → IMPORTANT: Add Volume at /app/data in Settings"
echo "   → Set env: DATABASE_URL=file:/app/data/konsoleh.db"
echo ""
echo "2. Render (Alternative)"
echo "   → Go to: https://render.com"
echo "   → New Web Service → Connect GitHub"
echo "   → Build: npm install && npx prisma generate && npm run build"
echo "   → Start: npx prisma db push --skip-generate && npm start"
echo "   → Add Persistent Disk at /app/data"
echo ""
echo "3. Docker (Self-hosted)"
echo "   → Run: docker build -t konsoleh-verifier ."
echo "   → Run: docker run -d -p 3000:3000 -v data:/app/data konsoleh-verifier"
echo ""
echo "4. VPS/Server"
echo "   → See DEPLOYMENT.md for full instructions"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT.md"
echo ""
