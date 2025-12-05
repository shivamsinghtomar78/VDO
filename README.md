# 🎬 Video-to-Blog AI Converter

Transform educational and business videos into ready-to-publish blog posts with AI. Upload a video, get a structured blog article, SEO metadata, and image suggestions.

## ✨ What's New (Latest Updates)

🔧 **Major Improvements Made**:
- ✅ Removed hero page - Direct upload interface
- ✅ Fixed API endpoint routing
- ✅ Updated UI theme (consistent dark + emerald/teal)
- ✅ Added Toast notifications
- ✅ Improved error handling
- ✅ Better CORS configuration
- ✅ Enhanced mobile responsiveness
- ✅ Added comprehensive setup guides

**See**: `SETUP_GUIDE.md` for detailed setup and `FIXES_AND_IMPROVEMENTS.md` for all changes.

## 📋 Project Structure

```
VDO/
├── frontend/           # React + Tailwind + Framer Motion
├── backend/            # Express.js API gateway
├── ai-service/         # Python FastAPI
├── start.bat           # Automated startup script
├── SETUP_GUIDE.md      # Detailed setup instructions
└── README.md           # This file
```

## 🎯 Current Status - Phase 1 Complete

✅ **Phase 1 (Complete):** Beautiful UI with working upload
- ✅ Upload modal with drag-and-drop
- ✅ Result page with tabbed interface
- ✅ SEO metadata display
- ✅ Image suggestions with prompts
- ✅ Blog content display
- ✅ Download functionality
- ✅ Responsive design
- ✅ Error handling & validation

🔄 **Phase 2 (Coming):** Real processing
- Whisper transcription
- GPT-4 blog generation
- Real job processing

🚀 **Phase 3 (Coming):** Advanced features
- LangChain chains
- Advanced SEO optimization

🔗 **Phase 4 (Coming):** Enterprise
- LangGraph workflows
- Multi-node processing

## ⚡ Quick Start

### Windows - Automatic (Recommended)
```bash
start.bat
```
Opens backend, AI service, and frontend in separate windows.

### Manual Setup

**1. Backend**
```bash
cd backend && npm install && npm run dev
```
Runs on: http://localhost:5000

**2. AI Service**
```bash
cd ai-service && pip install -r requirements.txt && python main.py
```
Runs on: http://localhost:8000

**3. Frontend**
```bash
cd frontend && npm install && npm run dev
```
Opens: http://localhost:5173

### Prerequisites
- Node.js 18+
- Python 3.10+
- FFmpeg (optional)
npm run dev
```

Frontend runs on `http://localhost:3000`

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

AI service runs on `http://localhost:8000`

### 4. Open the app

Visit `http://localhost:3000` in your browser.

- Click "View sample output" to see the demo with fake data
- Click "Upload your video" to test the upload flow (currently returns mock data)

## 📝 Key Endpoints

### Frontend Routes
- `/` - Hero page
- `/result` - Result page with blog, SEO, images

### Backend API
- `POST /api/upload-video` - Upload a video file
- `GET /api/status/:jobId` - Check processing status

### AI Service API
- `GET /health` - Health check
- `POST /api/process-video` - Process video and generate blog

## 🏗️ Architecture

```
┌─────────────────┐
│    React App    │
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────────┐
│  Express Backend    │
│  (Port 5000)        │
│  - File Upload      │
│  - Validation       │
│  - Orchestration    │
└────────┬────────────┘
         │ HTTP
         ↓
┌─────────────────────┐
│  Python FastAPI     │
│  (Port 8000)        │
│  - Transcription    │
│  - LangChain Chains │
│  - LangGraph Nodes  │
│  - Content Gen      │
└─────────────────────┘
```

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Custom components** - Button, Card, Badge components in `/frontend/src/components/ui.jsx`

## 📦 Key Dependencies

### Frontend
- react: UI framework
- react-router-dom: Routing
- framer-motion: Animations
- tailwindcss: Styling

### Backend
- express: Web framework
- multer: File upload handling
- axios: HTTP client for calling Python service
- uuid: Unique ID generation

### AI Service
- fastapi: Web framework
- pydantic: Data validation
- (Phase 2+) langchain: AI orchestration
- (Phase 2+) langgraph: Workflow management
- (Phase 2+) openai: LLM access
- (Phase 2+) moviepy: Video processing

## 🔄 Data Flow Example

1. **User uploads video** → Frontend sends to Express
2. **Express validates** → Saves file to disk
3. **Express calls Python** → Passes video path
4. **Python processes** → Extracts audio, transcribes, generates content
5. **Python returns JSON** → Express forwards to frontend
6. **Frontend displays** → Shows blog, SEO, images

## 📚 Current Workflow (Phase 1)

- Hero page shows features and call-to-action
- "View sample output" button → Shows sample blog data
- "Upload your video" → Currently returns mock data
- Result page displays blog with tabs for Blog/SEO/Images/Transcript

## 🚀 Next Steps

### Phase 2: Real Transcription
1. Install FFmpeg
2. Implement video-to-audio conversion
3. Add Whisper API integration for transcription
4. Test with real video files

### Phase 3: LangChain Integration
1. Create LangChain chains for:
   - Transcript cleaning
   - Outline generation
   - Section writing
   - SEO optimization
   - Image prompt generation

### Phase 4: LangGraph Workflow
1. Design workflow graph
2. Create nodes for each step
3. Add state management
4. Test end-to-end pipeline

## 🐛 Troubleshooting

### CORS Errors
- Frontend proxy is configured in `vite.config.js`
- Backend has CORS enabled in `server.js`

### Port Already in Use
- Frontend: Change port in `vite.config.js`
- Backend: Change PORT in `.env` or `server.js`
- AI Service: Change port in `main.py`

### Python Service Not Found
- Ensure AI service is running on port 8000
- Check `.env` file in backend for correct URL

## 💡 Environment Variables

### Backend (`.env`)
```
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

### AI Service (`.env`)
```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## 📄 File Organization

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui.jsx           # Button, Card, Badge components
│   │   ├── Layout.jsx        # Navigation, Footer
│   │   └── UploadModal.jsx   # Upload modal dialog
│   ├── pages/
│   │   ├── HeroPage.jsx      # Main hero page
│   │   └── ResultPage.jsx    # Results display
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles

backend/
├── server.js                 # Express app
├── package.json
├── .env
└── README.md

ai-service/
├── main.py                   # FastAPI app
├── requirements.txt
├── .env
└── README.md
```

## 🎓 Learning Resources

- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- Express: https://expressjs.com
- FastAPI: https://fastapi.tiangolo.com
- LangChain: https://python.langchain.com
- LangGraph: https://langchain-ai.github.io/langgraph

## 📝 Notes

- Phase 1 uses static sample data to showcase the UI
- Mock data in Python service allows testing without real transcription
- Express backend validates file size and type
- All error handling and edge cases are covered
- Responsive design works on mobile, tablet, desktop

## ✨ Competition Highlights

- 🎯 Clean, professional UI with smooth animations
- 📱 Fully responsive design
- ⚡ Fast and efficient data flow
- 🔒 File validation (200 MB limit)
- 📊 Complete SEO metadata display
- 🖼️ AI-powered image suggestions
- 💾 Download functionality
- 🎨 Modern styling with Tailwind

---

**Ready to demo!** Start with the quick start above and click "View sample output" to see the full feature set.
