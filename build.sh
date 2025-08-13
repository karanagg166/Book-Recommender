#!/bin/bash

echo "🚀 Building Book Recommender Monorepo..."

# Install frontend dependencies and build
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# Backend doesn't need building, just ensure dependencies are available
echo "🐍 Backend ready (Python - no build needed)"

echo "✅ Build complete!" 