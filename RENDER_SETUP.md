# Render Deployment Setup

## What Changed

The project is now configured for single unified deployment on Render:

### New Files Created

1. **server.js** - Unified server that:
   - Serves frontend static files
   - Handles API requests
   - Proxies to AI service

2. **package.json** - Root dependencies for deployment

3. **Procfile** - Render configuration

4. **build.sh** - Build script

5. **frontend/.env.production** - Production environment

6. **DEPLOYMENT.md** - Detailed deployment guide

## Quick Deploy to Render

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Service
1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Select this repository

### Step 3: Configure Service
- **Name**: vdo-app
- **Environment**: Node
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Plan**: Free or Paid

### Step 4: Add Environment Variables
```
PORT=10000
PYTHON_SERVICE_URL=http://localhost:8000
DEEPGRAM_API_KEY=your_key
OPENROUTER_API_KEY=your_key
```

### Step 5: Deploy
Click "Create Web Service" and wait for deployment.

## Architecture

```
Render Web Service
    ↓
server.js (Node.js)
    ├── Serves frontend/dist
    ├── Handles /api/* routes
    └── Proxies to AI service
```

## Local Testing

```bash
npm run build
npm start
# Visit http://localhost:5000
```

## What's Included

- ✅ Frontend (React) - Built and served
- ✅ Backend API (Express) - Unified server
- ✅ AI Service - Optional separate deployment
- ✅ File uploads - Handled by Express
- ✅ CORS - Configured
- ✅ Static files - Served from dist/

## Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| PORT | 10000 | Auto (Render) |
| PYTHON_SERVICE_URL | AI service URL | Optional |
| DEEPGRAM_API_KEY | Your key | Optional |
| OPENROUTER_API_KEY | Your key | Optional |

## Troubleshooting

**Build fails?**
- Check Node version (18+)
- Clear cache: `rm -rf node_modules package-lock.json`

**API not working?**
- Check PYTHON_SERVICE_URL
- Verify AI service is running

**Frontend not loading?**
- Check frontend/dist exists
- Clear browser cache

## Next Steps

1. Deploy to Render
2. Test upload functionality
3. Monitor logs in Render dashboard
4. Scale as needed

---

Ready to deploy! Follow the Quick Deploy steps above.
