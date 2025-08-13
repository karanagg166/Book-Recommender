#!/bin/bash

echo "🚀 Book Recommender - Vercel Deployment Script"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel first:"
    vercel login
fi

echo ""
echo "📦 Step 1: Deploying Backend..."
echo "================================="

cd backend

# Deploy backend
echo "🚀 Deploying backend to Vercel..."
vercel --prod --yes

# Get backend URL
BACKEND_URL=$(vercel ls | grep backend | awk '{print $2}')
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL=$(vercel ls | grep -E ".*\.vercel\.app" | head -1 | awk '{print $2}')
fi

echo "✅ Backend deployed to: $BACKEND_URL"

cd ..

echo ""
echo "🔧 Step 2: Deploying Frontend..."
echo "=================================="

cd frontend

# Set environment variable for the build
export NEXT_PUBLIC_API_BASE=$BACKEND_URL

# Deploy frontend
echo "🚀 Deploying frontend to Vercel..."
vercel --prod --yes

# Get frontend URL
FRONTEND_URL=$(vercel ls | grep frontend | awk '{print $2}')
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL=$(vercel ls | grep -E ".*\.vercel\.app" | head -1 | awk '{print $2}')
fi

echo "✅ Frontend deployed to: $FRONTEND_URL"

cd ..

echo ""
echo "⚙️  Step 3: Final Configuration"
echo "================================"
echo ""
echo "🎯 Your deployment URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo ""
echo "🔧 Important: Set environment variable in Vercel dashboard:"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Select your frontend project"
echo "   3. Go to Settings → Environment Variables"
echo "   4. Add: NEXT_PUBLIC_API_BASE = $BACKEND_URL"
echo "   5. Redeploy frontend: cd frontend && vercel --prod"
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "- Test your API endpoints at $BACKEND_URL"
echo "- Test your frontend at $FRONTEND_URL"
echo "- Set up custom domain if desired"
echo "- Monitor performance in Vercel dashboard" 