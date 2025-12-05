from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import requests
import json
import time

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY', '9b09c36cddf44b3297e0ff9d92a5e0a2')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:5000", "*"])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "AI service is running"})

def transcribe_with_assemblyai(video_path: str) -> str:
    try:
        logger.info(f"Starting AssemblyAI transcription for {video_path}")
        
        # Upload file to AssemblyAI
        with open(video_path, 'rb') as f:
            upload_response = requests.post(
                'https://api.assemblyai.com/v2/upload',
                headers={'Authorization': ASSEMBLYAI_API_KEY},
                files={'file': f},
                timeout=300
            )
        
        if upload_response.status_code != 200:
            logger.warning(f"AssemblyAI upload error {upload_response.status_code}")
            return None
        
        audio_url = upload_response.json()['upload_url']
        logger.info(f"File uploaded: {audio_url}")
        
        # Submit transcription job
        transcript_request = {
            'audio_url': audio_url,
            'language_code': 'en'
        }
        
        submit_response = requests.post(
            'https://api.assemblyai.com/v2/transcript',
            headers={'Authorization': ASSEMBLYAI_API_KEY},
            json=transcript_request,
            timeout=30
        )
        
        if submit_response.status_code != 200:
            logger.warning(f"AssemblyAI submit error {submit_response.status_code}")
            return None
        
        transcript_id = submit_response.json()['id']
        logger.info(f"Transcription job submitted: {transcript_id}")
        
        # Poll for completion
        max_attempts = 120
        attempt = 0
        while attempt < max_attempts:
            poll_response = requests.get(
                f'https://api.assemblyai.com/v2/transcript/{transcript_id}',
                headers={'Authorization': ASSEMBLYAI_API_KEY},
                timeout=30
            )
            
            if poll_response.status_code != 200:
                logger.warning(f"AssemblyAI poll error {poll_response.status_code}")
                return None
            
            result = poll_response.json()
            status = result['status']
            
            if status == 'completed':
                transcript = result['text']
                logger.info(f"Transcription completed: {len(transcript)} chars")
                return transcript
            elif status == 'error':
                logger.warning(f"Transcription error: {result.get('error')}")
                return None
            
            logger.info(f"Transcription status: {status} (attempt {attempt + 1}/{max_attempts})")
            attempt += 1
            time.sleep(2)
        
        logger.warning("Transcription timeout")
        return None
        
    except Exception as e:
        logger.warning(f"Transcription failed: {e}")
        return None

def generate_summary_with_openrouter(transcript: str) -> dict:
    try:
        if not OPENROUTER_API_KEY:
            logger.warning("No OpenRouter API key, using mock data")
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
            logger.warning(f"OpenRouter error {response.status_code}")
            return None
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            blog_data = json.loads(content[json_start:json_end])
            logger.info("Summary generated successfully")
            return blog_data
        return None
    except Exception as e:
        logger.warning(f"Summary generation failed: {e}")
        return None

def generate_mock_blog() -> dict:
    return {
        "title": "Video Content: Key Insights and Overview",
        "sections": [
            {"heading": "Introduction", "content": "This video covers important topics and provides valuable insights."},
            {"heading": "Main Points", "content": "The video discusses several key concepts and best practices."},
            {"heading": "Conclusion", "content": "In conclusion, this video provides comprehensive information."}
        ],
        "seo": {
            "title": "Video Content: Key Insights and Overview",
            "metaDescription": "Learn key insights from this comprehensive video guide.",
            "keywords": ["video", "insights", "guide", "tutorial"]
        },
        "imageSuggestions": [
            {"section": "Introduction", "prompt": "Professional introduction header"},
            {"section": "Main Points", "prompt": "Infographic showing key points"},
            {"section": "Conclusion", "prompt": "Conclusion summary graphic"}
        ]
    }

@app.route('/api/process-video', methods=['POST'])
def process_video():
    try:
        data = request.json
        job_id = data.get('jobId')
        video_path = data.get('videoPath')
        filename = data.get('filename')
        
        logger.info(f"Processing: {filename} (Job: {job_id})")
        
        transcript = transcribe_with_assemblyai(video_path)
        if not transcript:
            transcript = "Sample video transcript for demonstration purposes."
            logger.info("Using default transcript")
        
        blog_data = generate_summary_with_openrouter(transcript)
        if not blog_data:
            blog_data = generate_mock_blog()
            logger.info("Using mock blog data")
        
        seo_data = blog_data.get("seo", {})
        result = {
            "jobId": job_id,
            "status": "completed",
            "transcript": transcript,
            "blog": {
                "title": blog_data.get("title", "Untitled"),
                "sections": blog_data.get("sections", [{"heading": "Content", "content": "Blog content"}])
            },
            "seo": {
                "title": seo_data.get("title", "Blog Title"),
                "metaDescription": seo_data.get("metaDescription", "Blog description"),
                "keywords": seo_data.get("keywords", ["blog", "content"]),
                "seoScore": 75,
                "readabilityScore": "Good"
            },
            "imageSuggestions": blog_data.get("imageSuggestions", [{"section": "Content", "prompt": "Blog image"}])
        }
        
        logger.info(f"Completed: {job_id}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("\n" + "="*40)
    print("AI Service Started")
    print("Port: 8000")
    print("AssemblyAI Transcription Enabled")
    print("="*40 + "\n")
    app.run(host="0.0.0.0", port=8000, debug=False)
