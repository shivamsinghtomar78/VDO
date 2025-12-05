# Developer Guide - AI Video-to-Blog Converter

## Project Architecture

```
project/
├── frontend/              # React + Vite UI
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Helper functions
│   │   └── App.jsx       # Main app component
│   └── vite.config.js
│
├── backend/               # Express.js API server
│   ├── server.js         # Main server file
│   └── uploads/          # Temporary video storage
│
└── ai-service/           # Python Flask AI processing
    ├── main.py           # Main AI service
    └── requirements.txt
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## API Specification

### Backend Endpoints

#### `POST /api/upload-video`
Upload and process a video file.

**Request**:
```javascript
{
  file: File,           // Video file (multipart/form-data)
  timeout: 300000ms     // 5 minute timeout
}
```

**Response**:
```javascript
{
  jobId: "uuid",
  status: "completed",
  transcript: "...",
  blog: {
    title: "...",
    sections: [
      {
        heading: "...",
        content: "..."
      }
    ]
  },
  seo: {
    title: "...",
    metaDescription: "...",
    keywords: ["keyword1", "keyword2"],
    seoScore: 75,
    readabilityScore: "Good"
  },
  imageSuggestions: [
    {
      section: "...",
      prompt: "..."
    }
  ]
}
```

#### `GET /api/status/:jobId`
Check processing status (for future async implementation).

#### `GET /health`
Health check endpoint.

---

### AI Service Endpoints

#### `POST /api/process-video`
Process video and generate content.

**Request**:
```python
{
  "jobId": "uuid",
  "videoPath": "/path/to/video.mp4",
  "filename": "video.mp4"
}
```

**Response**: Same as backend upload-video

#### `GET /health`
Health check endpoint.

---

## Frontend Components

### Key Components

#### `App.jsx`
- Router setup
- Error boundary
- Loading provider
- Toast notifications

#### `HeroPage.jsx`
- Landing page
- Upload modal trigger
- CTA buttons
- Feature showcase

#### `ResultPage.jsx`
- Tab navigation (Blog, SEO, Images, Transcript)
- Content display
- Download functionality
- Animations

#### `UploadModal.jsx`
- Drag & drop upload
- File validation
- Progress tracking
- Error handling

#### `components/`
- `Layout.jsx` - Navigation bar
- `ui.jsx` - UI components
- `Loading.jsx` - Loading overlay
- `Toast.jsx` - Toast notifications
- `ErrorBoundary.jsx` - Error handling

---

## Configuration

### Environment Variables

**.env (Backend)**
```
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

**.env (AI Service)**
```
DEEPGRAM_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

**.env (Frontend - .env.local)**
```
VITE_API_URL=http://localhost:5000
```

---

## AI Service Integration

### Deepgram (Transcription)

**Service**: Speech-to-text transcription
**Model**: nova-2 (latest)
**Pricing**: Free tier available (50,000 minutes/month)
**Accuracy**: ~95% with clear audio

**Setup**:
1. Go to https://console.deepgram.com
2. Create account
3. Get API key
4. Add to `.env` file

### OpenRouter (Content Generation)

**Service**: LLM API with multiple models
**Model**: amazon/nova-2-lite-v1 (free)
**Features**: Blog generation, SEO optimization
**Pricing**: Free tier available

**Setup**:
1. Go to https://openrouter.ai
2. Create account
3. Get API key
4. Add to `.env` file

---

## Future Enhancements

### Priority 1: High Impact
- [ ] **Async Processing**: Move to job queue system
  - Use Bull/RabbitMQ for queuing
  - Webhook notifications when done
  - Support very long videos

- [ ] **Database Integration**: Store results
  - MongoDB or PostgreSQL
  - User accounts & history
  - Saved projects

- [ ] **Multiple AI Models**: Compare results
  - GPT-4 vs Claude vs Llama
  - User selection of model
  - Cost optimization

### Priority 2: Medium Impact
- [ ] **Batch Processing**: Process multiple videos
  - Upload folder of videos
  - Bulk export options
  - Scheduled processing

- [ ] **Direct Image Generation**: DALL-E Integration
  - Auto-generate images from prompts
  - Built-in image editor
  - Gallery of generated images

- [ ] **Blog Publishing**: Direct Integration
  - WordPress plugin
  - Medium integration
  - Substack integration

### Priority 3: Nice to Have
- [ ] **Mobile App**: React Native version
- [ ] **Desktop App**: Electron version
- [ ] **Teams/Organizations**: Multi-user support
- [ ] **Templates**: Custom blog templates
- [ ] **A/B Testing**: Multiple versions
- [ ] **Analytics**: Track generated blogs performance

---

## Performance Optimization

### Current Bottlenecks
1. **Deepgram API**: Transcription can take 1-2 min
2. **OpenRouter API**: Content generation 30-60 sec
3. **Network**: File upload/download

### Optimization Ideas
1. **Caching**: Store processed results
2. **CDN**: Serve static files from CDN
3. **Lazy Loading**: Load components on demand
4. **Code Splitting**: Split bundle by route
5. **Compression**: Gzip responses
6. **Worker Threads**: Process videos in background

---

## Security Considerations

### File Upload
- ✅ File size validation (200 MB)
- ✅ File type validation
- ✅ Unique filename generation
- ✅ Virus scanning (TODO)

### API Security
- ⚠️ No authentication yet
- ⚠️ Rate limiting needed
- ⚠️ HTTPS not enforced
- ⚠️ CORS open to localhost only

### Data Protection
- ❌ No encryption at rest
- ✅ No data persistence (TODO)
- ❌ GDPR compliance needed
- ⚠️ Terms of service needed

---

## Testing

### Unit Tests
```bash
npm test                 # Frontend
python -m pytest        # AI Service
```

### Integration Tests
```bash
npm run test:e2e        # End-to-end tests
```

### Manual Testing Checklist
- [ ] Upload video < 200 MB
- [ ] Upload video > 200 MB (should fail)
- [ ] Try invalid file type (should fail)
- [ ] Check transcription accuracy
- [ ] Verify blog sections
- [ ] Check SEO metadata
- [ ] Validate image prompts
- [ ] Test all tabs
- [ ] Test download functionality
- [ ] Test responsive design
- [ ] Test error states

---

## Deployment

### Development
```bash
npm run dev              # Frontend
npm start               # Backend
python main.py          # AI Service
```

### Production
```bash
# Frontend
npm run build
npm run preview

# Backend
NODE_ENV=production npm start

# AI Service
python main.py
```

### Docker Deployment
```bash
docker-compose up       # Run all services
```

---

## Troubleshooting

### Common Issues

#### "Cannot connect to backend"
- Check PORT (5000)
- Check CORS settings
- Verify backend is running

#### "AI Service timeout"
- Check PYTHON_SERVICE_URL
- Verify AI service is running
- Check network connectivity

#### "Video upload fails"
- Check file size < 200 MB
- Check file type is supported
- Check disk space

#### "Results not displaying"
- Check localStorage
- Open browser console (F12)
- Check for validation errors

---

## Contributing

### Code Style
- Frontend: ESLint + Prettier
- Backend: Standard Node.js conventions
- AI Service: PEP 8 Python standards

### Git Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR
5. Code review
6. Merge to main

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
test: Add tests
```

---

## Resources

### Documentation
- [React Docs](https://react.dev)
- [Express.js Docs](https://expressjs.com)
- [Flask Docs](https://flask.palletsprojects.com)
- [Deepgram Docs](https://developers.deepgram.com)
- [OpenRouter Docs](https://openrouter.ai/docs)

### Libraries
- Frontend: React, Vite, Tailwind, Framer Motion
- Backend: Express, Multer, Axios
- AI: Flask, Requests

---

## Support

For technical issues:
1. Check logs (terminal, browser console)
2. Check GitHub issues
3. Submit bug report with:
   - Error message
   - Steps to reproduce
   - Environment info
   - Screenshots/videos

