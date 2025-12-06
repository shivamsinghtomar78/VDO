# 🎬 Video-to-Blog AI Converter

Transform videos into ready-to-publish blog posts with AI. Upload a video, get structured blog articles, SEO metadata, and image suggestions.

## 🚀 Quick Start

### Windows
```bash
start.bat
```

### Mac/Linux
```bash
bash start.sh
```

## 📋 Features

- ✅ Video upload with drag-and-drop
- ✅ AI-powered transcription (Deepgram)
- ✅ Blog generation (OpenRouter)
- ✅ Image suggestions (Freepik)
- ✅ SEO metadata optimization
- ✅ Responsive design

## 🛠️ Technology Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Express.js + Multer
- **AI Service**: Flask + Python
- **APIs**: Deepgram, OpenRouter, Freepik

## 📦 Setup

1. **Install Dependencies**:
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install

# AI Service
cd ai-service && pip install -r requirements.txt
```

2. **Configure API Keys** in `ai-service/.env`:
```
DEEPGRAM_API_KEY=your_deepgram_key
OPENROUTER_API_KEY=your_openrouter_key
FREEPIK_API_KEY=your_freepik_key
```

3. **Start Services**:
```bash
# Backend (Port 5000)
cd backend && npm run dev

# AI Service (Port 8000)
cd ai-service && python main.py

# Frontend (Port 5173)
cd frontend && npm run dev
```

## 🔌 API Endpoints

### Backend (`localhost:5000`)
- `POST /api/upload-video` - Upload and process video
- `GET /api/status/:jobId` - Check processing status
- `GET /health` - Health check

### AI Service (`localhost:8000`)
- `POST /api/process-video` - Process video and generate blog
- `GET /health` - Health check
- `GET /debug` - Debug information

## 📁 Project Structure

```
VDO/
├── frontend/          # React application
├── backend/           # Express API server
├── ai-service/        # Python Flask service
├── start.bat          # Windows startup
├── restart-ai.bat     # Restart AI service
└── README.md          # This file
```

## 🎯 Usage

1. Open `http://localhost:5173`
2. Upload a video file (MP4, WebM, MOV, AVI)
3. Wait for AI processing
4. View generated blog content, SEO data, and image suggestions
5. Download or copy the results

## 🔧 File Specifications

- **Supported Formats**: MP4, WebM, MOV, AVI
- **Max Size**: 200 MB
- **Requirements**: Video must contain audible speech

## 🐛 Troubleshooting

### Port Issues
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### API Key Issues
- Check `ai-service/.env` file
- Verify keys are valid and active
- Check console logs for errors

### No Audio Detected
- Ensure video contains speech
- Check video file isn't corrupted
- Try a different video format

## 📄 License

MIT License - Open source project.