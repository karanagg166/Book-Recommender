# 🚀 Deploy Book Recommender to Vercel - Complete Guide

## ✅ **What's Been Fixed**

1. **Auto-detection of API URL** - Frontend automatically detects if it's on Vercel and uses the correct API path
2. **Proper Vercel configuration** - `vercel.json` configured for monorepo deployment
3. **All components updated** - All frontend components now use the centralized API utility
4. **Backend imports fixed** - Python backend properly configured for Vercel serverless functions

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Your Project**

Your project is already configured! Just make sure you have:
- ✅ All files committed (or ready to upload)
- ✅ `vercel.json` in root directory
- ✅ `backend/api/index.py` exists
- ✅ `frontend/package.json` exists

### **Step 2: Deploy to Vercel**

#### **Option A: Upload via Vercel Dashboard (Recommended)**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Choose "Upload" option**
4. **Drag and drop your ENTIRE `Book-recommender` folder**
   - ⚠️ **Important**: Upload the ENTIRE folder, not just frontend or backend
5. **Configure Project Settings:**
   - **Project Name**: `book-recommender` (or your preferred name)
   - **Framework Preset**: `Other` (Vercel will auto-detect)
   - **Root Directory**: `/` (leave as default)
   - **Build Command**: Leave empty (auto-detected)
   - **Output Directory**: Leave empty (auto-detected)
6. **Click "Deploy"**

#### **Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /path/to/Book-recommender
vercel --prod
```

### **Step 3: Wait for Deployment**

- First deployment may take 5-10 minutes
- Vercel will:
  1. Install frontend dependencies (`npm install` in frontend/)
  2. Build frontend (`npm run build`)
  3. Set up Python backend as serverless functions
  4. Deploy everything

### **Step 4: Verify Deployment**

After deployment completes:

1. **Check your deployment URL** (e.g., `https://book-recommender-abc123.vercel.app`)

2. **Test Backend API:**
   - Visit: `https://your-project.vercel.app/api/`
   - Should show: `{"message": "Book Recommender API", ...}`
   - Visit: `https://your-project.vercel.app/api/genres`
   - Should return: `{"genres": [...], "count": X}`

3. **Test Frontend:**
   - Visit: `https://your-project.vercel.app/`
   - Should load the homepage
   - Genres should load automatically (no more "0 genres available")

### **Step 5: (Optional) Set Environment Variable**

**You don't need to set `NEXT_PUBLIC_API_BASE` anymore!** 

The frontend now automatically detects if it's on Vercel and uses the correct API path (`/api`).

However, if you want to override it:
1. Go to **Settings** → **Environment Variables**
2. Add: `NEXT_PUBLIC_API_BASE = https://your-project.vercel.app/api`
3. Redeploy

## 🎯 **How It Works**

### **Frontend API Detection**

The frontend uses `frontend/src/utils/api.ts` which:
- **On Vercel**: Automatically uses `https://your-domain.vercel.app/api`
- **In Development**: Uses `http://localhost:8000` or `NEXT_PUBLIC_API_BASE` env var

### **Backend Routing**

Vercel routes:
- `/api/*` → `backend/api/index.py` (Python serverless function)
- `/*` → `frontend/*` (Next.js app)

### **File Structure**

```
Book-recommender/
├── vercel.json          # Vercel configuration
├── backend/
│   ├── api/
│   │   └── index.py     # FastAPI serverless function
│   ├── requirements.txt # Python dependencies
│   └── books.csv        # Data file
└── frontend/
    ├── package.json     # Node dependencies
    └── src/
        └── utils/
            └── api.ts   # API URL detection
```

## 🐛 **Troubleshooting**

### **Backend Returns 404**

1. **Check Vercel Functions:**
   - Go to your project → **Functions** tab
   - Look for `backend/api/index.py`
   - Check function logs for errors

2. **Verify File Structure:**
   - Ensure `backend/api/index.py` exists
   - Ensure `backend/requirements.txt` exists

3. **Check Build Logs:**
   - Go to **Deployments** → Click on deployment → **Build Logs**
   - Look for Python-related errors

### **Frontend Can't Connect to Backend**

1. **Check Browser Console:**
   - Open DevTools → Console
   - Look for API call errors
   - Verify API calls are going to `/api/*` not `localhost:8000`

2. **Verify API Utility:**
   - The frontend should auto-detect Vercel domain
   - Check `frontend/src/utils/api.ts` is being used

### **Genres Not Loading**

1. **Test Backend Directly:**
   - Visit: `https://your-project.vercel.app/api/genres`
   - Should return JSON with genres

2. **Check CORS:**
   - Backend has CORS enabled for all origins
   - Should work automatically

## ✅ **Success Indicators**

After successful deployment:
- ✅ Frontend loads at `https://your-project.vercel.app/`
- ✅ Backend API accessible at `https://your-project.vercel.app/api/`
- ✅ Genres load automatically (not "0 genres available")
- ✅ Recommendations work
- ✅ Search works
- ✅ Analytics work

## 📝 **Next Steps**

1. **Custom Domain** (Optional):
   - Go to **Settings** → **Domains**
   - Add your custom domain

2. **Environment Variables** (If needed):
   - Go to **Settings** → **Environment Variables**
   - Add any additional variables

3. **Monitor Performance:**
   - Check **Analytics** tab in Vercel dashboard
   - Monitor function execution times

## 🎉 **You're All Set!**

Your Book Recommender is now fully deployed and should work end-to-end!

