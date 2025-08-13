#!/usr/bin/env python3
"""
Test script to verify backend API functionality
Run this locally to test: python test-backend.py
"""

import requests
import json

def test_backend():
    """Test the backend API endpoints"""
    
    # Test root endpoint
    print("🔍 Testing root endpoint...")
    try:
        response = requests.get("http://localhost:8000/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
    
    print("\n🔍 Testing genres endpoint...")
    try:
        response = requests.get("http://localhost:8000/genres")
        print(f"✅ Genres endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Genres endpoint failed: {e}")
    
    print("\n🔍 Testing recommendations endpoint...")
    try:
        response = requests.get("http://localhost:8000/recommend?genre=fiction")
        print(f"✅ Recommendations endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Recommendations endpoint failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Book Recommender Backend...")
    print("Make sure your backend is running on http://localhost:8000")
    print("=" * 50)
    test_backend() 