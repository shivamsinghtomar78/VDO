# 🎬 Video-to-Blog AI Converter

Transform videos into ready-to-publish blog posts with AI. Upload a video, get structured blog articles, SEO metadata, and image suggestions.

## 📋 Project Overview

A full-stack application that converts video content into professional blog posts using AI. Features include:
- Video upload with drag-and-drop
- AI-powered blog generation
- SEO metadata optimization
- Image suggestions with prompts
- Responsive design with smooth animations

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Vite** - Build tool

### Backend
- **Express.js** - API server
- **Multer** - File upload handling
- **Axios** - HTTP client
- **UUID** - ID generation
- **CORS** - Cross-origin support

### AI Service
- **Python FastAPI** - API framework
- **Pydantic** - Data validation
- **Deepgram** - Transcription (optional)
- **OpenRouter** - LLM integration (optional)

## 📦 Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Project

```bash
git clone <repository-url>
cd VDO
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Setup AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
python main.py
```

AI Service runs on: `http://localhost:8000`

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Quick Start (Windows)

```bash
start.bat
```

This opens all three services in separate terminal windows.

## 🔌 API Endpoints

### Backend API (`http://localhost:5000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-video` | Upload and process video |
| GET | `/api/status/:jobId` | Check processing status |
| GET | `/health` | Health check |

### AI Service API (`http://localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/process-video` | Process video and generate blog |

## 📁 Project Structure

```
VDO/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utilities & services
│   └── package.json
├── backend/               # Express API server
│   ├── server.js
│   ├── uploads/           # Uploaded videos
│   └── package.json
├── ai-service/            # Python FastAPI service
│   ├── main.py
│   └── requirements.txt
├── start.bat              # Windows startup script
└── README.md              # This file
```

## 🔧 Environment Variables

### Backend (`.env`)
```
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

### AI Service (`.env`)
```
DEEPGRAM_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000
```

## 📊 Data Flow

```
User Upload
    ↓
Frontend → Backend (Express)
    ↓
Backend → AI Service (Python)
    ↓
AI Service processes video
    ↓
Returns blog data
    ↓
Frontend displays results
```

## 🎯 Features

- ✅ Drag-and-drop video upload
- ✅ Real-time processing status
- ✅ AI-generated blog content
- ✅ SEO metadata optimization
- ✅ Image suggestions with prompts
- ✅ Download blog as text
- ✅ Responsive mobile design
- ✅ Error handling & validation
- ✅ 200 MB file size limit

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

### CORS Errors
- Ensure all three services are running
- Check backend CORS configuration in `server.js`
- Verify frontend API URL in `.env`

### Python Service Not Found
- Ensure AI service is running on port 8000
- Check `PYTHON_SERVICE_URL` in backend `.env`

## 📝 File Upload Specifications

- **Supported Formats**: MP4, WebM, MOV, AVI
- **Max Size**: 200 MB
- **Processing Time**: Depends on video length

## 🔐 Security

- File type validation on backend
- File size limits enforced
- CORS properly configured
- Input validation on all endpoints

## 📚 API Request Examples

### Upload Video

```bash
curl -X POST http://localhost:5000/api/upload-video \
  -F "video=@video.mp4"
```

### Check Status

```bash
curl http://localhost:5000/api/status/job-id-here
```

## 🎨 UI Components

- Upload Modal with drag-and-drop
- Result page with tabbed interface
- Blog content display
- SEO metadata cards
- Image suggestion gallery
- Transcript viewer

## 📱 Responsive Design

- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend
```bash
cd backend
npm install --production
node server.js
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all services are running
3. Check console for error messages
4. Ensure environment variables are set correctly

## 📄 License

This project is open source and available under the MIT License.

---

**Ready to use!** Follow the installation steps above to get started.
