#!/bin/bash

echo "🚀 Book Recommender - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
    echo ""
fi

echo "📋 Deployment Options:"
echo "====================="
echo ""
echo "1. Upload via Vercel Dashboard (Recommended for first time)"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Click 'New Project' → 'Upload'"
echo "   - Drag and drop your ENTIRE Book-recommender folder"
echo "   - Click 'Deploy'"
echo ""
echo "2. Deploy via CLI (Run this script again and choose option 2)"
echo ""
read -p "Choose option (1 or 2): " option

if [ "$option" == "2" ]; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    echo "========================="
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Visit your deployment URL (shown above)"
    echo "2. Test the API: https://your-project.vercel.app/api/"
    echo "3. Test the frontend: https://your-project.vercel.app/"
    echo ""
    echo "🎉 Your Book Recommender is now live!"
else
    echo ""
    echo "📖 Follow these steps:"
    echo "===================="
    echo ""
    echo "1. Open: https://vercel.com/dashboard"
    echo "2. Click 'New Project'"
    echo "3. Choose 'Upload'"
    echo "4. Drag and drop your ENTIRE Book-recommender folder"
    echo "5. Configure:"
    echo "   - Project Name: book-recommender"
    echo "   - Framework: Other (auto-detected)"
    echo "   - Build Command: (leave empty)"
    echo "   - Output Directory: (leave empty)"
    echo "6. Click 'Deploy'"
    echo ""
    echo "⏳ Wait 5-10 minutes for first deployment"
    echo ""
    echo "✅ After deployment:"
    echo "   - Frontend: https://your-project.vercel.app/"
    echo "   - Backend API: https://your-project.vercel.app/api/"
    echo ""
    echo "📚 Full guide: See DEPLOY_TO_VERCEL.md"
fi

