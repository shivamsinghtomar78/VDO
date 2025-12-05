# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.10+ installed
- npm installed

---

## Option 1: Automated (Windows)

```bash
start.bat
```

This opens 3 terminal windows automatically:
1. Backend (Port 5000)
2. AI Service (Port 8000)
3. Frontend (Port 5173)

Then open: **http://localhost:5173**

---

## Option 2: Manual Setup (All Platforms)

### Step 1: Install Dependencies

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```

**AI Service**
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

---

### Step 2: Start Services

Open 3 separate terminals:

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```
Runs on: http://localhost:5000

**Terminal 2 - AI Service**
```bash
cd ai-service
python main.py
```
Runs on: http://localhost:8000

**Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
```
Runs on: http://localhost:5173

---

### Step 3: Access the App

Open your browser and go to:
```
http://localhost:5173
```

---

## 🎯 What You'll See

1. **Home Page** with upload modal visible
2. **Upload Video** button to select a video
3. **View Sample Output** to see demo results
4. **Result Page** with 4 tabs:
   - 📝 Blog Article
   - 🔍 SEO Metadata
   - 🖼️ Image Suggestions
   - 📄 Transcript

---

## ✅ Testing

### Test Upload
1. Click "Upload Your Video"
2. Select any video file (MP4, WebM, MOV, AVI)
3. Click "Upload & Convert"
4. See results with mock data

### Test Sample
1. Click "View Sample Output"
2. See demo blog content

### Test Features
- Click tabs to switch between Blog/SEO/Images/Transcript
- Click "Download Blog" to download as text
- Click "Home" to go back

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :8000  # AI Service
netstat -ano | findstr :5173  # Frontend

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Dependencies Not Installed
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# AI Service
cd ai-service && pip install -r requirements.txt
```

### Python Not Found
```bash
# Check Python version
python --version

# Should be 3.10+
```

### Node Not Found
```bash
# Check Node version
node --version

# Should be 18+
```

---

## 📊 Service Status

Check if services are running:

**Backend Health**
```
GET http://localhost:5000/health
```

**AI Service Health**
```
GET http://localhost:8000/health
```

---

## 🎨 Features to Try

✅ Upload video file  
✅ View sample output  
✅ Download blog content  
✅ View SEO metadata  
✅ See image suggestions  
✅ Read transcript  
✅ Responsive design (try mobile view)  

---

## 📝 Environment Variables

Already configured in `.env` files:

**Backend** (.env)
```
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

**AI Service** (.env)
```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

**Frontend** (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Next Steps

1. ✅ Run the project
2. ✅ Test all features
3. ✅ Verify everything works
4. 📋 Plan Phase 2 (real processing)

---

## 💡 Tips

- Keep all 3 terminals open while developing
- Check browser console for errors (F12)
- Check terminal output for backend/AI service logs
- Use "View Sample Output" to test without uploading

---

**Ready to go!** 🎉

Open http://localhost:5173 in your browser.
