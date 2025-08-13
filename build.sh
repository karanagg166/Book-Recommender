#!/bin/bash

echo "🚀 Building Book Recommender Monorepo..."

# Install frontend dependencies and build
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# Ensure Python backend is ready
echo "🐍 Preparing Backend..."
cd backend

# Create a requirements.txt if it doesn't exist
if [ ! -f "requirements.txt" ]; then
    echo "Creating requirements.txt..."
    echo "fastapi" > requirements.txt
    echo "uvicorn" >> requirements.txt
    echo "pandas" >> requirements.txt
    echo "numpy" >> requirements.txt
    echo "scikit-learn" >> requirements.txt
    echo "matplotlib" >> requirements.txt
    echo "seaborn" >> requirements.txt
    echo "nltk" >> requirements.txt
    echo "joblib" >> requirements.txt
    echo "mangum" >> requirements.txt
fi

# Ensure the API directory exists
mkdir -p api

# Copy the main API file if it doesn't exist
if [ ! -f "api/index.py" ]; then
    echo "Copying API files..."
    cp -r ../backend/api/* api/ 2>/dev/null || echo "API files already in place"
fi

cd ..

echo "✅ Build complete!"
echo "📁 Frontend built in: frontend/.next"
echo "🐍 Backend ready in: backend/api/" 