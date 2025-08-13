#!/bin/bash

echo "🚀 Simple Vercel Deployment for Book Recommender"
echo "================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo ""
echo "📋 Deployment Instructions:"
echo "==========================="
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Choose 'Upload' option"
echo "4. Drag and drop your ENTIRE Book-recommender folder"
echo "5. In project settings, ensure:"
echo "   - Framework Preset: Other"
echo "   - Build Command: (leave empty - auto-detect)"
echo "   - Output Directory: (leave empty - auto-detect)"
echo "6. Click Deploy"
echo ""
echo "7. After deployment, go to Settings → Environment Variables:"
echo "   - Name: NEXT_PUBLIC_API_BASE"
echo "   - Value: https://your-project-name.vercel.app/api"
echo "8. Redeploy to apply environment variables"
echo ""
echo "🎯 Your current frontend: https://book-recommender-pied.vercel.app/"
echo "🔧 Backend should be at: https://your-new-project.vercel.app/api/"
echo ""
echo "📝 Note: Upload the ENTIRE folder, not just frontend or backend" 