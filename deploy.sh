#!/bin/bash

echo "🚀 Book Recommender - Vercel Deployment Script"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo ""
echo "📦 Step 1: Deploying Frontend..."
echo "=================================="

cd frontend

# Check if already linked to Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking frontend to Vercel..."
    vercel --yes
else
    echo "✅ Frontend already linked to Vercel"
fi

echo "🚀 Deploying frontend..."
vercel --prod --yes

FRONTEND_URL=$(vercel ls | grep frontend | awk '{print $2}')
echo "✅ Frontend deployed to: $FRONTEND_URL"

cd ..

echo ""
echo "🔧 Step 2: Deploying Backend..."
echo "================================="

cd backend

# Check if already linked to Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking backend to Vercel..."
    vercel --yes
else
    echo "✅ Backend already linked to Vercel"
fi

echo "🚀 Deploying backend..."
vercel --prod --yes

BACKEND_URL=$(vercel ls | grep backend | awk '{print $2}')
echo "✅ Backend deployed to: $BACKEND_URL"

cd ..

echo ""
echo "⚙️  Step 3: Configuration Instructions"
echo "======================================"
echo ""
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Select your frontend project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add the following environment variable:"
echo "   - Name: NEXT_PUBLIC_API_BASE"
echo "   - Value: $BACKEND_URL"
echo "   - Environment: Production, Preview, Development"
echo ""
echo "5. Redeploy your frontend to apply the environment variable:"
echo "   cd frontend && vercel --prod"
echo ""
echo "🎉 Deployment complete!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""
echo "📝 Next steps:"
echo "- Test all features on the deployed site"
echo "- Set up monitoring and analytics"
echo "- Configure custom domain if desired" 