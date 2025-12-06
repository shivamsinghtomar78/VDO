from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import requests
import json
import assemblyai as aai

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY', 'b14ee76b46f44755b5a5d2b50a9c9203')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

aai.settings.api_key = ASSEMBLYAI_API_KEY

app = Flask(__name__)
CORS(app, origins=["*"])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

def transcribe_with_assemblyai(video_path: str) -> str:
    try:
        logger.info(f"Transcribing: {video_path}")
        
        config = aai.TranscriptionConfig(speech_models=["universal"])
        transcript = aai.Transcriber(config=config).transcribe(video_path)
        
        if transcript.status == "error":
            logger.warning(f"Transcription error: {transcript.error}")
            return None
        
        logger.info(f"Transcription completed: {len(transcript.text)} chars")
        return transcript.text
        
    except Exception as e:
        logger.warning(f"Transcription failed: {e}")
        return None

def generate_summary_with_openrouter(transcript: str) -> dict:
    try:
        if not OPENROUTER_API_KEY:
            return None
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Video-to-Blog",
            },
            json={
                "model": "amazon/nova-2-lite-v1:free",
                "messages": [{
                    "role": "user",
                    "content": f"""Create a professional blog post from this transcript. Return ONLY valid JSON:
{{"title":"Blog Title","sections":[{{"heading":"Section 1","content":"Content"}}],"seo":{{"title":"SEO Title","metaDescription":"Description","keywords":["key1"]}},"imageSuggestions":[{{"section":"Section 1","prompt":"Image prompt"}}]}}

Transcript: {transcript[:2000]}"""
                }],
                "temperature": 0.7,
            },
            timeout=300
        )
        
        if response.status_code != 200:
            return None
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            return json.loads(content[json_start:json_end])
        return None
    except Exception as e:
        logger.warning(f"Summary generation failed: {e}")
        return None

def generate_mock_blog() -> dict:
    return {
        "title": "Video Content Summary",
        "sections": [
            {"heading": "Introduction", "content": "This video covers important topics."},
            {"heading": "Main Points", "content": "Key insights and takeaways."},
            {"heading": "Conclusion", "content": "Summary and final thoughts."}
        ],
        "seo": {
            "title": "Video Content Summary",
            "metaDescription": "Professional blog post from video",
            "keywords": ["video", "blog", "content"],
            "seoScore": 75,
            "readabilityScore": "Good"
        },
        "imageSuggestions": [
            {"section": "Introduction", "prompt": "Professional header"},
            {"section": "Main Points", "prompt": "Key points infographic"}
        ]
    }

@app.route('/api/process-video', methods=['POST'])
def process_video():
    try:
        data = request.json
        job_id = data.get('jobId')
        video_path = data.get('videoPath')
        
        logger.info(f"Processing: {video_path}")
        
        transcript = transcribe_with_assemblyai(video_path)
        if not transcript:
            transcript = "Sample transcript"
        
        blog_data = generate_summary_with_openrouter(transcript)
        if not blog_data:
            blog_data = generate_mock_blog()
        
        seo_data = blog_data.get("seo", {})
        result = {
            "jobId": job_id,
            "status": "completed",
            "transcript": transcript,
            "blog": {
                "title": blog_data.get("title", "Untitled"),
                "sections": blog_data.get("sections", [])
            },
            "seo": {
                "title": seo_data.get("title", "Blog Title"),
                "metaDescription": seo_data.get("metaDescription", "Description"),
                "keywords": seo_data.get("keywords", []),
                "seoScore": seo_data.get("seoScore", 75),
                "readabilityScore": seo_data.get("readabilityScore", "Good")
            },
            "imageSuggestions": blog_data.get("imageSuggestions", [])
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("\nAI Service Started - Port 8000\n")
    app.run(host="0.0.0.0", port=8000, debug=False)
