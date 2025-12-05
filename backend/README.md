# Backend for Video-to-Blog AI Converter

This is the Express backend that handles:
- Video file uploads (up to 200 MB)
- Validation of video files
- Communication with Python AI service
- Serving the frontend in production

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The server runs on port 5000 and expects the Python service to be running on port 8000.

## Environment Variables

Create a `.env` file:

```
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

## API Endpoints

### POST /api/upload-video
Upload a video file for processing

Request:
- multipart/form-data
- Field: `video` (file, max 200 MB)

Response:
```json
{
  "jobId": "uuid",
  "status": "processing|completed",
  "transcript": "...",
  "blog": { "title": "...", "sections": [...] },
  "seo": { "title": "...", "metaDescription": "...", "keywords": [...] },
  "imageSuggestions": [...]
}
```

### GET /api/status/:jobId
Check the status of a processing job

## Uploads Storage

Uploaded videos are stored in the `uploads/` directory.
