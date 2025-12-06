from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import requests
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
FREEPIK_API_KEY = os.getenv('FREEPIK_API_KEY')

# Log available APIs on startup
if DEEPGRAM_API_KEY:
    logger.info('✓ Deepgram API key configured')
else:
    logger.warning('⚠ Deepgram API key NOT set - transcription will use mock data')

if OPENROUTER_API_KEY:
    logger.info('✓ OpenRouter API key configured')
else:
    logger.warning('⚠ OpenRouter API key NOT set - blog generation will use mock data')

if FREEPIK_API_KEY:
    logger.info('✓ Freepik API key configured')
else:
    logger.warning('⚠ Freepik API key NOT set - image suggestions will use mock data')

app = Flask(__name__)
CORS(app, origins=["*"])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/debug', methods=['GET'])
def debug():
    backend_uploads = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'uploads')
    files = []
    if os.path.exists(backend_uploads):
        files = os.listdir(backend_uploads)
    
    return jsonify({
        "deepgram_key_present": bool(DEEPGRAM_API_KEY),
        "openrouter_key_present": bool(OPENROUTER_API_KEY),
        "freepik_key_present": bool(FREEPIK_API_KEY),
        "backend_uploads_path": backend_uploads,
        "backend_uploads_exists": os.path.exists(backend_uploads),
        "files_in_uploads": files,
        "current_dir": os.getcwd()
    })

def transcribe_with_deepgram(video_path: str) -> dict:
    """Transcribe video using Deepgram API.
    
    Returns: {'success': bool, 'text': str, 'error': str or None}
    """
    if not DEEPGRAM_API_KEY:
        logger.info('Deepgram not configured - using mock transcription')
        return {'success': False, 'text': None, 'error': 'DEEPGRAM_API_KEY not set', 'mock': True}
    
    try:
        logger.info(f"Transcribing video: {video_path}")
        
        # Check if file exists and log file info
        if not os.path.exists(video_path):
            error_msg = f"Video file not found: {video_path}"
            logger.error(error_msg)
            # Try to find the file in backend/uploads
            backend_uploads = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'uploads')
            if os.path.exists(backend_uploads):
                files = os.listdir(backend_uploads)
                logger.error(f"Available files in backend/uploads: {files}")
            return {'success': False, 'text': None, 'error': error_msg}
        
        file_size = os.path.getsize(video_path)
        logger.info(f"File exists: {video_path} ({file_size} bytes)")
        
        # Stream file to Deepgram instead of reading into memory
        with open(video_path, 'rb') as audio_file:
            logger.info(f"Streaming video file to Deepgram: {video_path}")
            
            # Use Deepgram REST API directly
            response = requests.post(
                "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
                headers={
                    "Authorization": f"Token {DEEPGRAM_API_KEY}",
                    "Content-Type": "application/octet-stream"
                },
                data=audio_file,
                timeout=300
            )
        
        if response.status_code != 200:
            error_msg = f"Deepgram API error: {response.status_code} - {response.text}"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        
        result = response.json()
        
        # Check if transcription was successful
        if not result.get('results', {}).get('channels') or len(result['results']['channels']) == 0:
            error_msg = f"No audio detected in video file. Duration: {result.get('metadata', {}).get('duration', 0)} seconds"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        
        if len(result['results']['channels'][0].get('alternatives', [])) == 0:
            error_msg = "No transcription alternatives found - video may not contain speech"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        
        transcript_text = result['results']['channels'][0]['alternatives'][0]['transcript']
        
        if not transcript_text or transcript_text.strip() == "":
            error_msg = "Transcription returned empty text - video may not contain audible speech"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        logger.info(f"✓ Transcription completed: {len(transcript_text)} characters")
        return {'success': True, 'text': transcript_text, 'error': None}
        
    except Exception as e:
        error_msg = f"Deepgram transcription exception: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Video path: {video_path}")
        logger.error(f"API key present: {bool(DEEPGRAM_API_KEY)}")
        return {'success': False, 'text': None, 'error': error_msg}

def generate_summary_with_openrouter(transcript: str) -> dict:
    """Generate blog summary using OpenRouter API.
    
    Returns: {'success': bool, 'data': dict or None, 'error': str or None}
    """
    if not OPENROUTER_API_KEY:
        logger.info('OpenRouter not configured - using mock blog generation')
        return {'success': False, 'data': None, 'error': 'OPENROUTER_API_KEY not set', 'mock': True}
    
    try:
        logger.info('Generating blog summary with OpenRouter')
        
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
                    "content": f"""Create a professional blog post from this transcript. Return ONLY valid JSON with no escape characters or special formatting:
{{"title":"Blog Title","sections":[{{"heading":"Section 1","content":"Content here"}}],"seo":{{"title":"SEO Title","metaDescription":"Description","keywords":["key1"]}},"imageSuggestions":[{{"section":"Section 1","prompt":"Image prompt"}}]}}

Important: Do not use backslashes or special escape sequences in your response.

Transcript: {transcript[:2000]}"""
                }],
                "temperature": 0.7,
            },
            timeout=300
        )
        
        if response.status_code != 200:
            error_msg = f"OpenRouter API error: {response.status_code} - {response.text[:200]}"
            logger.error(error_msg)
            return {'success': False, 'data': None, 'error': error_msg}
        
        result = response.json()
        content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        # Clean up the content - remove problematic escape sequences
        content = content.replace('\\"', '"').replace("\\'", "'")
        # Remove invalid escape sequences by replacing backslash followed by non-escape chars
        import re
        content = re.sub(r'\\(?!["\\/bfnrtu])', '', content)
        
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = content[json_start:json_end]
            try:
                blog_data = json.loads(json_str)
                logger.info('✓ Blog summary generated successfully')
                return {'success': True, 'data': blog_data, 'error': None}
            except json.JSONDecodeError as je:
                # Try a more aggressive cleanup
                json_str = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', json_str)  # Remove control chars
                json_str = json_str.replace('\\n', ' ').replace('\\t', ' ')
                blog_data = json.loads(json_str)
                logger.info('✓ Blog summary generated successfully (with cleanup)')
                return {'success': True, 'data': blog_data, 'error': None}
        
        error_msg = 'No valid JSON found in OpenRouter response'
        logger.error(error_msg)
        return {'success': False, 'data': None, 'error': error_msg}
    except Exception as e:
        error_msg = f"Blog generation exception: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'data': None, 'error': error_msg}

def generate_image_suggestions(sections: list) -> list:
    """Generate image suggestions using Freepik API."""
    if not FREEPIK_API_KEY or not sections:
        return [
            {"section": "Introduction", "prompt": "Professional header image"},
            {"section": "Main Content", "prompt": "Content illustration"}
        ]
    
    try:
        suggestions = []
        for section in sections[:3]:
            heading = section.get('heading', 'Content')
            
            # Simple search terms
            search_terms = ["business", "technology", "professional", "modern"]
            query = search_terms[len(suggestions) % len(search_terms)]
            
            response = requests.get(
                f"https://api.freepik.com/v1/resources",
                headers={'x-freepik-api-key': FREEPIK_API_KEY},
                params={'query': query, 'limit': 1},
                timeout=10
            )
            
            logger.info(f"Freepik API response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Freepik data: {data}")
                suggestions.append({
                    "section": heading,
                    "prompt": f"Professional image for {heading}"
                })
            else:
                logger.error(f"Freepik error: {response.status_code} - {response.text}")
                suggestions.append({
                    "section": heading,
                    "prompt": f"Image for {heading}"
                })
        
        return suggestions if suggestions else [
            {"section": "Introduction", "prompt": "Professional header"},
            {"section": "Content", "prompt": "Main illustration"}
        ]
        
    except Exception as e:
        logger.error(f"Image suggestion error: {e}")
        return [
            {"section": "Introduction", "prompt": "Professional header"},
            {"section": "Content", "prompt": "Main illustration"}
        ]

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
        
        logger.info(f"Processing video: {video_path} (Job: {job_id})")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Video path is absolute: {os.path.isabs(video_path)}")
        
        # Convert relative path to absolute path if needed
        if not os.path.isabs(video_path):
            # If path is relative, assume it's relative to backend directory
            backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
            video_path = os.path.join(backend_dir, video_path)
            logger.info(f"Converted to absolute path: {video_path}")
        
        # Normalize path separators
        video_path = os.path.normpath(video_path)
        logger.info(f"Normalized path: {video_path}")
        
        # Step 1: Transcribe video
        transcription_result = transcribe_with_deepgram(video_path)
        transcript = transcription_result.get('text')
        transcription_warning = None
        
        if not transcription_result.get('success'):
            transcription_warning = transcription_result.get('error')
            logger.warning(f"Transcription warning: {transcription_warning}")
            if transcription_result.get('mock'):
                transcript = "Sample transcript (Deepgram API not configured)"
            else:
                transcript = "Sample transcript (transcription failed)"
        
        # Step 2: Generate blog summary
        blog_generation_result = generate_summary_with_openrouter(transcript)
        blog_data = blog_generation_result.get('data')
        generation_warning = None
        
        if not blog_generation_result.get('success'):
            generation_warning = blog_generation_result.get('error')
            logger.warning(f"Blog generation warning: {generation_warning}")
            if blog_generation_result.get('mock'):
                blog_data = generate_mock_blog()
            else:
                blog_data = generate_mock_blog()
        
        # Build response
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
            "imageSuggestions": generate_image_suggestions(blog_data.get("sections", []))
        }
        
        # Add warnings if using fallbacks
        warnings = []
        if transcription_warning:
            warnings.append(f"Transcription: {transcription_warning}")
        if generation_warning:
            warnings.append(f"Blog Generation: {generation_warning}")
        
        if warnings:
            result["warnings"] = warnings
            logger.info(f"Processed with warnings: {warnings}")
        else:
            logger.info(f"✓ Video processed successfully")
        
        return jsonify(result), 200
        
    except Exception as e:
        error_msg = f"Processing error: {str(e)}"
        logger.error(error_msg)
        return jsonify({"error": error_msg, "jobId": data.get('jobId')}), 500

def extract_youtube_video_id(url: str) -> str:
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def transcribe_youtube(video_id: str) -> dict:
    """Get transcript from YouTube video using youtube-transcript-api.
    
    Returns: {'success': bool, 'text': str, 'error': str or None}
    """
    try:
        logger.info(f"Fetching YouTube transcript for video: {video_id}")
        
        # Try to get transcript (auto-generated or manual)
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try to get English transcript first, then any available
        transcript = None
        try:
            transcript = transcript_list.find_transcript(['en', 'en-US', 'en-GB'])
        except:
            # Get any available transcript and translate to English
            for t in transcript_list:
                transcript = t
                break
        
        if not transcript:
            return {'success': False, 'text': None, 'error': 'No transcript available for this video'}
        
        # Fetch the actual transcript text
        transcript_data = transcript.fetch()
        
        # Combine all text segments
        full_text = ' '.join([segment['text'] for segment in transcript_data])
        
        logger.info(f"✓ YouTube transcript fetched: {len(full_text)} characters")
        return {'success': True, 'text': full_text, 'error': None}
        
    except Exception as e:
        error_msg = f"YouTube transcript error: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'text': None, 'error': error_msg}

@app.route('/api/process-youtube', methods=['POST'])
def process_youtube():
    """Process a YouTube video URL and generate blog content."""
    try:
        data = request.json
        job_id = data.get('jobId')
        youtube_url = data.get('youtubeUrl')
        
        logger.info(f"Processing YouTube URL: {youtube_url} (Job: {job_id})")
        
        # Extract video ID
        video_id = extract_youtube_video_id(youtube_url)
        if not video_id:
            return jsonify({"error": "Invalid YouTube URL", "jobId": job_id}), 400
        
        logger.info(f"Extracted video ID: {video_id}")
        
        # Get transcript from YouTube
        transcription_result = transcribe_youtube(video_id)
        transcript = transcription_result.get('text')
        transcription_warning = None
        
        if not transcription_result.get('success'):
            transcription_warning = transcription_result.get('error')
            logger.warning(f"YouTube transcription warning: {transcription_warning}")
            transcript = "Transcript not available for this video"
        
        # Generate blog summary
        blog_generation_result = generate_summary_with_openrouter(transcript)
        blog_data = blog_generation_result.get('data')
        generation_warning = None
        
        if not blog_generation_result.get('success'):
            generation_warning = blog_generation_result.get('error')
            logger.warning(f"Blog generation warning: {generation_warning}")
            blog_data = generate_mock_blog()
        
        # Build response
        seo_data = blog_data.get("seo", {})
        result = {
            "jobId": job_id,
            "status": "completed",
            "source": "youtube",
            "videoId": video_id,
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
            "imageSuggestions": generate_image_suggestions(blog_data.get("sections", []))
        }
        
        # Add warnings if using fallbacks
        warnings = []
        if transcription_warning:
            warnings.append(f"Transcription: {transcription_warning}")
        if generation_warning:
            warnings.append(f"Blog Generation: {generation_warning}")
        
        if warnings:
            result["warnings"] = warnings
            logger.info(f"YouTube processed with warnings: {warnings}")
        else:
            logger.info(f"✓ YouTube video processed successfully")
        
        return jsonify(result), 200
        
    except Exception as e:
        error_msg = f"YouTube processing error: {str(e)}"
        logger.error(error_msg)
        return jsonify({"error": error_msg, "jobId": data.get('jobId')}), 500

if __name__ == "__main__":
    print("\nAI Service Started - Port 8000\n")
    app.run(host="0.0.0.0", port=8000, debug=False)
