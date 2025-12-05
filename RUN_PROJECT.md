# 🚀 How to Run the Project

## Quick Start (Recommended)

### Windows Users
```bash
start.bat
```

This will:
1. ✅ Check Node.js and Python
2. ✅ Start Backend (Port 5000)
3. ✅ Start AI Service (Port 8000)
4. ✅ Start Frontend (Port 5173)
5. ✅ Open browser automatically

---

## Manual Setup (All Platforms)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- Python 3.10+ ([Download](https://www.python.org))
- npm (comes with Node.js)

### Verify Installation
```bash
node --version    # Should be v18+
python --version  # Should be 3.10+
npm --version     # Should be 8+
```

---

## Step-by-Step Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Setup AI Service
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

---

## Running Services

### Option A: Automated (Windows)
```bash
start.bat
```

### Option B: Manual (All Platforms)

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```
Output: `Backend running on http://localhost:5000`

**Terminal 2 - AI Service**
```bash
cd ai-service
python main.py
```
Output: `Uvicorn running on http://localhost:8000`

**Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
```
Output: `VITE v5.0.0 ready in XXX ms`

---

## Access the Application

Open your browser:
```
http://localhost:5173
```

You should see:
- 🏠 Home page with upload modal
- 📤 Upload button
- 👀 View Sample Output button

---

## Test the Application

### Test 1: View Sample Output
1. Click "👀 View Sample Output"
2. See demo blog content
3. Click tabs to view Blog/SEO/Images/Transcript
4. Click "📥 Download Blog" to download

### Test 2: Upload Video
1. Click "🚀 Upload Your Video"
2. Select a video file (MP4, WebM, MOV, AVI)
3. Click "🚀 Upload & Convert"
4. See results with mock data
5. Verify all tabs work

### Test 3: Test Features
- ✅ Click "Home" button to go back
- ✅ Try responsive design (F12 → Mobile view)
- ✅ Check toast notifications
- ✅ Verify error handling

---

## Service Health Check

### Check Backend
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok","message":"Backend service is running"}`

### Check AI Service
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"ok","message":"AI service is running"}`

---

## Troubleshooting

### Issue: "Port already in use"

**Find process using port:**
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5000
lsof -i :8000
lsof -i :5173
```

**Kill process:**
```bash
# Windows (replace PID)
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

---

### Issue: "Node.js not found"

Install Node.js from: https://nodejs.org (v18+)

Verify:
```bash
node --version
npm --version
```

---

### Issue: "Python not found"

Install Python from: https://www.python.org (3.10+)

Verify:
```bash
python --version
```

---

### Issue: "npm install fails"

Try:
```bash
npm cache clean --force
npm install
```

---

### Issue: "pip install fails"

Try:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

### Issue: "Frontend won't load"

Check:
1. Frontend running on port 5173
2. Backend running on port 5000
3. Browser console (F12) for errors
4. Terminal output for warnings

---

### Issue: "Upload fails"

Check:
1. Backend running on port 5000
2. AI Service running on port 8000
3. File is valid video format
4. File size < 200MB

---

## Environment Variables

Already configured in `.env` files:

**backend/.env**
```
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

**ai-service/.env**
```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

## Project Structure

```
VDO/
├── backend/          # Express server (Port 5000)
├── ai-service/       # FastAPI service (Port 8000)
├── frontend/         # React app (Port 5173)
├── start.bat         # Windows startup script
├── start.sh          # Unix startup script
└── README.md         # Documentation
```

---

## Ports Used

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| AI Service | 8000 | http://localhost:8000 |

---

## Stopping Services

### Windows
- Close each terminal window
- Or press Ctrl+C in each terminal

### Mac/Linux
- Press Ctrl+C in each terminal

---

## Next Steps

1. ✅ Run the project
2. ✅ Test all features
3. ✅ Verify everything works
4. 📋 Plan Phase 2 development

---

## Support

If you encounter issues:

1. Check terminal output for errors
2. Check browser console (F12)
3. Verify all prerequisites installed
4. Try restarting services
5. Check port availability

---

**Ready to go!** 🎉

Run `start.bat` or follow manual steps above.
