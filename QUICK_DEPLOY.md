# Quick Deploy to Vercel

## Prerequisites

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

## Option 1: Automated Deployment (Recommended)

Run the deployment script:
```bash
./deploy.sh
```

## Option 2: Manual Deployment

### Step 1: Deploy Frontend

```bash
cd frontend
vercel
```

### Step 2: Deploy Backend

```bash
cd ../backend
vercel
```

### Step 3: Configure Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add:
   - **Name**: `NEXT_PUBLIC_API_BASE`
   - **Value**: Your backend URL (e.g., `https://your-backend.vercel.app`)
   - **Environment**: Production, Preview, Development

### Step 4: Redeploy Frontend

```bash
cd frontend
vercel --prod
```

## Verify Deployment

1. **Test Frontend**: Visit your frontend URL
2. **Test Backend**: Visit `your-backend-url.vercel.app/`
3. **Test API**: Visit `your-backend-url.vercel.app/genres`

## Troubleshooting

- **CORS Errors**: Check environment variables are set correctly
- **404 Errors**: Verify API routes in `backend/api/index.py`
- **Cold Starts**: First request may take 5-10 seconds

## Support

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Review Vercel function logs in dashboard
- Test API endpoints independently 