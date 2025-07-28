# Book Recommender - Vercel Deployment Guide

This guide will help you deploy your Book Recommender project to Vercel.

## Project Structure

```
Book-recommender/
├── frontend/          # Next.js frontend
├── backend/           # FastAPI backend
└── data/             # Data files
```

## Deployment Options

### Option 1: Deploy Frontend to Vercel (Recommended)

This is the easiest approach since Vercel is optimized for Next.js applications.

#### Step 1: Deploy Frontend

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

#### Step 2: Deploy Backend

1. **Navigate to backend directory**:
   ```bash
   cd ../backend
   ```

2. **Deploy backend to Vercel**:
   ```bash
   vercel
   ```

3. **Note the backend URL** (e.g., `https://your-backend.vercel.app`)

#### Step 3: Configure Environment Variables

1. **Go to your Vercel dashboard**
2. **Select your frontend project**
3. **Go to Settings → Environment Variables**
4. **Add the following variable**:
   - Name: `NEXT_PUBLIC_API_BASE`
   - Value: `https://your-backend.vercel.app` (replace with your actual backend URL)
   - Environment: Production, Preview, Development

### Option 2: Deploy Backend to Alternative Platform

If you prefer to deploy the backend to a different platform (Railway, Render, Heroku), follow these steps:

#### Backend Deployment (Railway Example)

1. **Create a Railway account** at https://railway.app
2. **Connect your GitHub repository**
3. **Deploy the backend directory**
4. **Set environment variables** if needed
5. **Get the deployment URL**

#### Frontend Deployment

1. **Deploy frontend to Vercel** as described in Option 1
2. **Set the environment variable** `NEXT_PUBLIC_API_BASE` to your backend URL

## Environment Variables

### Frontend (.env.local for development)
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Frontend (Vercel Environment Variables)
```
NEXT_PUBLIC_API_BASE=https://your-backend-url.vercel.app
```

## Important Notes

1. **CORS Configuration**: The backend is already configured to allow CORS from any origin (`*`). For production, you might want to restrict this to your frontend domain.

2. **Data Files**: Make sure your `books.csv` file is included in the backend deployment.

3. **Dependencies**: The backend requirements.txt includes all necessary dependencies including `mangum` for Vercel serverless functions.

4. **Cold Starts**: Vercel serverless functions may have cold start delays. The first request might take a few seconds.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend URL is correctly set in the frontend environment variables.

2. **404 Errors**: Check that your API routes are correctly configured in `backend/api/index.py`.

3. **Import Errors**: Make sure all Python dependencies are listed in `requirements.txt`.

4. **Data Loading Issues**: Verify that `books.csv` is accessible in the deployed backend.

### Debugging

1. **Check Vercel Function Logs**: Go to your Vercel dashboard → Functions → View logs
2. **Test API Endpoints**: Use tools like Postman or curl to test your backend endpoints
3. **Check Environment Variables**: Verify they're set correctly in Vercel dashboard

## Alternative Deployment Platforms

### Backend Alternatives

- **Railway**: Easy deployment with automatic scaling
- **Render**: Free tier available, good for Python apps
- **Heroku**: Traditional choice, requires credit card
- **DigitalOcean App Platform**: Good performance, reasonable pricing

### Frontend Alternatives

- **Netlify**: Great for static sites and Next.js
- **Vercel**: Best for Next.js (recommended)
- **GitHub Pages**: Free but limited for Next.js

## Performance Optimization

1. **Enable Vercel Analytics** for monitoring
2. **Use Vercel Edge Functions** for faster response times
3. **Implement caching** for frequently accessed data
4. **Optimize images** and static assets

## Security Considerations

1. **Restrict CORS origins** in production
2. **Add rate limiting** to API endpoints
3. **Validate input data** on both frontend and backend
4. **Use HTTPS** (automatic with Vercel)

## Monitoring and Analytics

1. **Vercel Analytics**: Built-in performance monitoring
2. **Error Tracking**: Consider adding Sentry for error monitoring
3. **API Monitoring**: Use tools like UptimeRobot for API health checks

## Cost Considerations

- **Vercel Hobby Plan**: Free for personal projects
- **Vercel Pro**: $20/month for team features
- **Backend Hosting**: Varies by platform ($5-20/month typical)

## Next Steps

After deployment:

1. **Test all features** thoroughly
2. **Set up monitoring** and analytics
3. **Configure custom domain** if desired
4. **Set up CI/CD** for automatic deployments
5. **Add error tracking** and logging

## Support

If you encounter issues:

1. Check the Vercel documentation
2. Review the function logs in Vercel dashboard
3. Test API endpoints independently
4. Verify environment variables are set correctly 