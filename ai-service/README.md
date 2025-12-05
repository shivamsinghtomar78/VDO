# AI Service for Video-to-Blog Converter

Python FastAPI service that handles the AI processing pipeline.

## Setup

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Development

```bash
python main.py
```

Or with auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The service runs on port 8000.

## Phases

**Phase 1 (Current):** Mock data generation - service returns dummy blog content

**Phase 2:** Real transcription
- Integrate with Whisper or other speech-to-text
- Extract audio from video files

**Phase 3:** LangChain integration
- Implement chains for content generation
- SEO optimization chain
- Image prompt generation

**Phase 4:** LangGraph workflow
- Create nodes for each step
- Connect nodes into a processing graph
- Handle state management

## API Endpoints

### GET /health
Health check

### POST /api/process-video
Process a video and generate blog

Request:
```json
{
  "jobId": "uuid",
  "videoPath": "/path/to/video.mp4",
  "filename": "video.mp4"
}
```

Response:
```json
{
  "jobId": "uuid",
  "status": "completed",
  "transcript": "...",
  "blog": { "title": "...", "sections": [...] },
  "seo": { "title": "...", ... },
  "imageSuggestions": [...]
}
```

## Environment Variables

Create a `.env` file:

```
OPENAI_API_KEY=your_key_here
```
