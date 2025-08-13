# 🚀 Vercel Deployment - Full Folder Upload

## 📁 **Method: Upload Entire Project Folder**

This guide shows how to deploy your entire Book Recommender project folder to Vercel.

## 🎯 **Step-by-Step Deployment**

### **Step 1: Prepare Your Project**
✅ Your project is already configured with:
- `vercel.json` - Root configuration
- `build.sh` - Build script for monorepo
- `backend/vercel.json` - Backend configuration
- `frontend/vercel.json` - Frontend configuration

### **Step 2: Upload to Vercel**
1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Choose "Upload" option**
4. **Drag and drop your entire `Book-recommender` folder**
5. **Click "Deploy"**

### **Step 3: Configure Project Settings**
- **Project Name**: `book-recommender` (or your preferred name)
- **Framework Preset**: `Other`
- **Root Directory**: `/` (leave as default)
- **Build Command**: `./build.sh` (should auto-detect)
- **Output Directory**: `frontend/.next` (should auto-detect)

### **Step 4: Set Environment Variables**
After deployment, go to **Settings** → **Environment Variables**:
- **Name**: `NEXT_PUBLIC_API_BASE`
- **Value**: `https://your-project-name.vercel.app/api`
- **Environment**: Production, Preview, Development

### **Step 5: Redeploy**
Click **Redeploy** to apply environment variables.

## 🔧 **What Happens During Deployment**

1. **Vercel uploads your entire folder**
2. **Runs `./build.sh` script which:**
   - Installs frontend dependencies (`npm install`)
   - Builds frontend (`npm run build`)
   - Prepares backend (Python files)
3. **Deploys as a monorepo with:**
   - Frontend served from `/`
   - Backend API accessible at `/api/*`
   - Static files served from `frontend/.next`

## 📍 **Your URLs After Deployment**

- **Main App**: `https://your-project-name.vercel.app`
- **API Endpoints**: `https://your-project-name.vercel.app/api/*`
- **Example API**: `https://your-project-name.vercel.app/api/genres`

## ⚠️ **Important Notes**

- **File Size**: Ensure your `books.csv` isn't too large (>50MB)
- **Build Time**: First build may take 5-10 minutes
- **Dependencies**: All npm packages will be installed during build
- **Python**: Vercel will handle Python runtime automatically

## 🚨 **Troubleshooting Backend Issues**

### **If Backend is Not Working:**

1. **Check Vercel Function Logs:**
   - Go to your project dashboard
   - Click on "Functions" tab
   - Look for `backend/api/index.py` function
   - Check for any error logs

2. **Verify Python Runtime:**
   - Ensure `requirements.txt` is in the backend folder
   - Check that all Python dependencies are listed

3. **Test API Endpoints:**
   - Try accessing: `https://your-project.vercel.app/api/`
   - Should return API information
   - Try: `https://your-project.vercel.app/api/genres`

4. **Common Issues:**
   - **Import Errors**: Check if all Python files are uploaded
   - **Data File Missing**: Ensure `books.csv` is in the backend folder
   - **Dependencies**: Verify all packages in `requirements.txt`

### **Local Testing:**
Before deploying, test locally:
```bash
cd backend
python -m uvicorn api.index:app --reload
```
Then run: `python ../test-backend.py`

## 🎉 **You're Ready!**

Your entire project folder is now configured for Vercel deployment. Just upload the folder and Vercel will handle the rest! 