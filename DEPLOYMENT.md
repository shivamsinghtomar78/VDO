# Deployment Guide - Render

Deploy the entire Video-to-Blog application on Render as a single unified service.

## Prerequisites

- GitHub account with repository
- Render account (https://render.com)
- Environment variables ready

## Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/VDO.git
git push -u origin main
```

### 2. Create Render Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: vdo-app
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### 3. Add Environment Variables

In Render dashboard, add:

```
PORT=10000
PYTHON_SERVICE_URL=http://localhost:8000
DEEPGRAM_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

### 4. Deploy AI Service (Optional)

For real transcription/generation, deploy AI service separately:

1. Create new Web Service
2. Select `ai-service` directory
3. Environment: Python
4. Build: `pip install -r requirements.txt`
5. Start: `python main.py`
6. Add API keys to environment

### 5. Update Backend URL

If AI service is deployed separately, update `PYTHON_SERVICE_URL` in Render environment variables to point to the AI service URL.

## Project Structure for Deployment

```
VDO/
├── server.js              # Unified server
├── package.json           # Root dependencies
├── Procfile               # Render configuration
├── build.sh               # Build script
├── frontend/              # React app
│   ├── dist/              # Built files (generated)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Express server (legacy)
│   ├── server.js
│   └── package.json
├── ai-service/            # Python service
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## How It Works

1. **Render starts the app** → Runs `npm start`
2. **npm start** → Executes `node server.js`
3. **server.js**:
   - Builds frontend if needed
   - Serves frontend static files
   - Handles API requests
   - Proxies to AI service
4. **Frontend** → Makes requests to `/api/*`
5. **Backend** → Processes and forwards to AI service

## Local Testing Before Deployment

```bash
# Build frontend
npm run build

# Start server
npm start

# Visit http://localhost:5000
```

## Troubleshooting

### Build Fails
- Check Node version: `node --version` (should be 18+)
- Clear cache: Delete `node_modules` and `package-lock.json`
- Rebuild: `npm install && npm run build`

### API Not Working
- Check `PYTHON_SERVICE_URL` environment variable
- Ensure AI service is running (if deployed separately)
- Check Render logs for errors

### Frontend Not Loading
- Verify `frontend/dist` exists after build
- Check `server.js` is serving static files correctly
- Clear browser cache

### Port Issues
- Render assigns port dynamically via `PORT` env var
- Don't hardcode port in code
- Use `process.env.PORT || 5000`

## Performance Tips

- Use Render's paid plan for better performance
- Enable caching in Render settings
- Optimize video file sizes
- Consider CDN for static assets

## Monitoring

- Check Render dashboard for logs
- Monitor resource usage
- Set up alerts for errors
- Review deployment history

## Scaling

For production:
1. Upgrade to paid Render plan
2. Deploy AI service separately
3. Add database for job tracking
4. Implement caching layer
5. Use CDN for frontend assets

---

**Deployment complete!** Your app is now live on Render.
