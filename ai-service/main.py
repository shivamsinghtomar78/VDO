from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import requests
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi
import assemblyai as aai
import subprocess
import tempfile
import random
import time
import sys

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
FREEPIK_API_KEY = os.getenv('FREEPIK_API_KEY')
ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY', '9b09c36cddf44b3297e0ff9d92a5e0a2')

# Configure AssemblyAI
aai.settings.api_key = ASSEMBLYAI_API_KEY

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

if ASSEMBLYAI_API_KEY:
    logger.info('✓ AssemblyAI API key configured')
else:
    logger.warning('⚠ AssemblyAI API key NOT set')

app = Flask(__name__)
CORS(app, origins=["*"])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Get available blog templates."""
    templates = []
    for key, value in BLOG_TEMPLATES.items():
        templates.append({
            "id": key,
            "name": value["name"],
            "description": value["structure"]
        })
    return jsonify({"templates": templates})

@app.route('/api/export', methods=['POST'])
def export_blog():
    """Export blog content in various formats."""
    try:
        data = request.json
        blog_data = data.get('blog', {})
        export_format = data.get('format', 'markdown').lower()
        
        if export_format == 'markdown':
            content = export_to_markdown(blog_data)
            return jsonify({"format": "markdown", "content": content, "extension": ".md"})
        elif export_format == 'html':
            content = export_to_html(blog_data)
            return jsonify({"format": "html", "content": content, "extension": ".html"})
        elif export_format == 'wordpress':
            content = export_to_wordpress(blog_data)
            return jsonify({"format": "wordpress", "content": content, "extension": ".json"})
        else:
            return jsonify({"error": f"Unknown format: {export_format}"}), 400
            
    except Exception as e:
        logger.error(f"Export error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/social-snippets', methods=['POST'])
def get_social_snippets():
    """Generate social media snippets from blog content."""
    try:
        data = request.json
        blog_data = data.get('blog', {})
        snippets = generate_social_snippets(blog_data)
        return jsonify({"snippets": snippets})
    except Exception as e:
        logger.error(f"Social snippets error: {e}")
        return jsonify({"error": str(e)}), 500


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

def transcribe_with_assemblyai(video_path: str) -> dict:
    """Transcribe video using AssemblyAI API.
    
    Returns: {'success': bool, 'text': str, 'error': str or None}
    """
    if not ASSEMBLYAI_API_KEY:
        logger.info('AssemblyAI not configured')
        return {'success': False, 'text': None, 'error': 'ASSEMBLYAI_API_KEY not set'}
    
    try:
        logger.info(f"Transcribing video with AssemblyAI: {video_path}")
        
        # Check if file exists
        if not os.path.exists(video_path):
            error_msg = f"Video file not found: {video_path}"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        
        file_size = os.path.getsize(video_path)
        logger.info(f"File exists: {video_path} ({file_size} bytes)")
        
        # Create transcriber
        transcriber = aai.Transcriber()
        
        # Transcribe the file
        transcript = transcriber.transcribe(video_path)
        
        if transcript.status == aai.TranscriptStatus.error:
            error_msg = f"AssemblyAI error: {transcript.error}"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        
        transcript_text = transcript.text
        
        if not transcript_text or transcript_text.strip() == "":
            error_msg = "Transcription returned empty text"
            logger.error(error_msg)
            return {'success': False, 'text': None, 'error': error_msg}
        
        logger.info(f"✓ AssemblyAI transcription completed: {len(transcript_text)} characters")
        return {'success': True, 'text': transcript_text, 'error': None}
        
    except Exception as e:
        error_msg = f"AssemblyAI transcription exception: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'text': None, 'error': error_msg}


# Blog Style Templates
BLOG_TEMPLATES = {
    "standard": {
        "name": "Standard Blog Post",
        "prompt": "Create a professional blog post from this transcript.",
        "structure": "Introduction, main content sections, and conclusion"
    },
    "tutorial": {
        "name": "Step-by-Step Tutorial",
        "prompt": "Create a step-by-step tutorial guide from this transcript. Include numbered steps, prerequisites, and tips.",
        "structure": "Prerequisites, Step-by-step instructions, Tips, Conclusion"
    },
    "listicle": {
        "name": "Listicle (Top N List)",
        "prompt": "Create an engaging listicle-style article from this transcript. Use numbered points with catchy subheadings.",
        "structure": "Introduction, Numbered list items with explanations, Conclusion"
    },
    "howto": {
        "name": "How-To Guide",
        "prompt": "Create a practical how-to guide from this transcript. Focus on actionable advice and clear instructions.",
        "structure": "Problem statement, Solution overview, Detailed steps, FAQs"
    },
    "opinion": {
        "name": "Opinion/Analysis Piece",
        "prompt": "Create an analytical opinion piece from this transcript. Include insights, perspectives, and supporting arguments.",
        "structure": "Thesis, Analysis sections, Counter-arguments, Conclusion"
    },
    "news": {
        "name": "News Article",
        "prompt": "Create a news-style article from this transcript. Use inverted pyramid structure with key facts first.",
        "structure": "Headline, Lead paragraph, Supporting details, Background"
    }
}

def generate_summary_with_openrouter(transcript: str, template: str = "standard") -> dict:
    """Generate blog summary using OpenRouter API.
    
    Returns: {'success': bool, 'data': dict or None, 'error': str or None}
    """
    if not OPENROUTER_API_KEY:
        logger.info('OpenRouter not configured - using mock blog generation')
        return {'success': False, 'data': None, 'error': 'OPENROUTER_API_KEY not set', 'mock': True}
    
    # Get template configuration
    template_config = BLOG_TEMPLATES.get(template, BLOG_TEMPLATES["standard"])
    template_prompt = template_config["prompt"]
    template_structure = template_config["structure"]
    
    try:
        logger.info(f'Generating blog summary with OpenRouter (template: {template})')
        
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
                    "content": f"""{template_prompt} Structure it as: {template_structure}

Return ONLY valid JSON with no escape characters or special formatting:
{{"title":"Blog Title","sections":[{{"heading":"Section 1","content":"Content here"}}],"seo":{{"title":"SEO Title","metaDescription":"Description","keywords":["key1"],"seoScore":85,"readabilityScore":"Good"}}}}

Important: Do not use backslashes or special escape sequences in your response.

Transcript: {transcript[:3000]}"""
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
        import re
        content = content.replace('\\"', '"').replace("\\'", "'")
        # Remove invalid escape sequences by replacing backslash followed by non-escape chars
        content = re.sub(r'\\(?!["\\/bfnrtu])', '', content)
        
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = content[json_start:json_end]
            
            # Try multiple parsing strategies
            parse_attempts = [
                lambda s: json.loads(s),  # Direct parse
                lambda s: json.loads(re.sub(r'[\x00-\x1f\x7f-\x9f]', '', s)),  # Remove control chars
                lambda s: json.loads(s.replace('\\n', ' ').replace('\\t', ' ')),  # Fix newlines
                lambda s: json.loads(re.sub(r',\s*}', '}', re.sub(r',\s*]', ']', s))),  # Fix trailing commas
            ]
            
            for i, parse_fn in enumerate(parse_attempts):
                try:
                    blog_data = parse_fn(json_str)
                    logger.info(f'✓ Blog summary generated successfully (parse attempt {i+1})')
                    return {'success': True, 'data': blog_data, 'error': None}
                except json.JSONDecodeError:
                    continue
            
            # All parsing attempts failed - log the problematic JSON
            logger.error(f'Failed to parse JSON after all attempts. First 500 chars: {json_str[:500]}')
        
        error_msg = 'No valid JSON found in OpenRouter response'
        logger.error(error_msg)
        return {'success': False, 'data': None, 'error': error_msg}
    except Exception as e:
        error_msg = f"Blog generation exception: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'data': None, 'error': error_msg}

def generate_image_suggestions(sections: list, blog_title: str = "") -> list:
    """Generate image suggestions using Freepik API with contextual prompts."""
    if not FREEPIK_API_KEY or not sections:
        # Return placeholder images if API key is not set
        return [
            {
                "section": "Introduction", 
                "prompt": "Professional header image", 
                "imageUrl": "https://placehold.co/800x400?text=Header+Image"
            },
            {
                "section": "Main Content", 
                "prompt": "Content illustration", 
                "imageUrl": "https://placehold.co/800x400?text=Content+Illustration"
            }
        ]
    
    def extract_keywords(text: str) -> str:
        """Extract meaningful keywords from text for image search."""
        # Remove common words and extract key terms
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                     'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                     'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
                     'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
                     'into', 'through', 'during', 'before', 'after', 'above', 'below',
                     'and', 'or', 'but', 'if', 'then', 'else', 'when', 'up', 'down',
                     'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their',
                     'we', 'our', 'you', 'your', 'i', 'my', 'he', 'she', 'him', 'her'}
        
        words = text.lower().split()
        keywords = [w for w in words if len(w) > 3 and w not in stop_words]
        return ' '.join(keywords[:5])
    
    try:
        suggestions = []
        for i, section in enumerate(sections[:4]):
            heading = section.get('heading', 'Content')
            content = section.get('content', '')
            
            # Generate contextual search query
            if content:
                query = extract_keywords(heading + ' ' + content)
            else:
                query = extract_keywords(heading)
            
            if not query:
                query = "professional business"
            
            logger.info(f"Searching Freepik for: {query}")
            
            response = requests.get(
                f"https://api.freepik.com/v1/resources",
                headers={'x-freepik-api-key': FREEPIK_API_KEY},
                params={'query': query, 'limit': 1, 'filters[content_type][photo]': 1},
                timeout=10
            )
            
            logger.info(f"Freepik API response: {response.status_code}")
            
            image_url = None
            if response.status_code == 200:
                data = response.json()
                if data.get('data') and len(data['data']) > 0:
                    resource = data['data'][0]
                    image_info = resource.get('image', {}).get('source', {})
                    image_url = image_info.get('url')
                    logger.info(f"Found image URL: {image_url}")
            
            suggestions.append({
                "section": heading,
                "prompt": f"AI-suggested image for: {query}",
                "imageUrl": image_url,
                "searchQuery": query
            })
        
        return suggestions if suggestions else [
            {"section": "Introduction", "prompt": "Professional header", "imageUrl": None},
            {"section": "Content", "prompt": "Main illustration", "imageUrl": None}
        ]
        
    except Exception as e:
        logger.error(f"Image suggestion error: {e}")
        return [
            {"section": "Introduction", "prompt": "Professional header", "imageUrl": None},
            {"section": "Content", "prompt": "Main illustration", "imageUrl": None}
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

# Export Functions
def export_to_markdown(blog_data: dict) -> str:
    """Convert blog data to Markdown format."""
    md = f"# {blog_data.get('title', 'Untitled')}\n\n"
    
    for section in blog_data.get('sections', []):
        md += f"## {section.get('heading', 'Section')}\n\n"
        md += f"{section.get('content', '')}\n\n"
    
    # Add SEO metadata as comments
    seo = blog_data.get('seo', {})
    md += "---\n\n"
    md += f"**SEO Title:** {seo.get('title', '')}\n\n"
    md += f"**Meta Description:** {seo.get('metaDescription', '')}\n\n"
    md += f"**Keywords:** {', '.join(seo.get('keywords', []))}\n"
    
    return md

def export_to_html(blog_data: dict) -> str:
    """Convert blog data to HTML format."""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{blog_data.get('seo', {}).get('metaDescription', '')}">
    <meta name="keywords" content="{', '.join(blog_data.get('seo', {}).get('keywords', []))}">
    <title>{blog_data.get('seo', {}).get('title', blog_data.get('title', 'Blog Post'))}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }}
        article {{ background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        h1 {{ color: #1a1a2e; border-bottom: 3px solid #4361ee; padding-bottom: 10px; }}
        h2 {{ color: #16213e; margin-top: 30px; }}
        p {{ color: #333; }}
    </style>
</head>
<body>
    <article>
        <h1>{blog_data.get('title', 'Untitled')}</h1>
"""
    
    for section in blog_data.get('sections', []):
        html += f"        <section>\n"
        html += f"            <h2>{section.get('heading', 'Section')}</h2>\n"
        html += f"            <p>{section.get('content', '')}</p>\n"
        html += f"        </section>\n"
    
    html += """    </article>
</body>
</html>"""
    
    return html

def export_to_wordpress(blog_data: dict) -> dict:
    """Convert blog data to WordPress-compatible format."""
    return {
        "post_title": blog_data.get('title', 'Untitled'),
        "post_content": "\n\n".join([
            f"<h2>{s.get('heading', '')}</h2>\n<p>{s.get('content', '')}</p>"
            for s in blog_data.get('sections', [])
        ]),
        "post_excerpt": blog_data.get('seo', {}).get('metaDescription', ''),
        "post_status": "draft",
        "meta": {
            "yoast_wpseo_title": blog_data.get('seo', {}).get('title', ''),
            "yoast_wpseo_metadesc": blog_data.get('seo', {}).get('metaDescription', ''),
            "yoast_wpseo_focuskw": blog_data.get('seo', {}).get('keywords', [''])[0] if blog_data.get('seo', {}).get('keywords') else ''
        },
        "tags": blog_data.get('seo', {}).get('keywords', [])
    }

# Social Media Snippet Generation
def generate_social_snippets(blog_data: dict) -> dict:
    """Generate social media snippets from blog content."""
    title = blog_data.get('title', 'Check this out!')
    sections = blog_data.get('sections', [])
    
    # Extract key points for snippets
    key_points = []
    for section in sections[:3]:
        content = section.get('content', '')
        if content:
            # Get first sentence
            sentences = content.split('.')
            if sentences:
                key_points.append(sentences[0].strip())
    
    # Twitter Thread (max 280 chars per tweet)
    twitter_thread = []
    twitter_thread.append(f"🧵 {title[:250]}")
    for i, point in enumerate(key_points, 1):
        twitter_thread.append(f"{i}/ {point[:270]}")
    twitter_thread.append("💡 Share if you found this useful! #content #blog")
    
    # LinkedIn Post (longer form)
    linkedin_post = f"""🎯 {title}

{chr(10).join([f"✅ {p}" for p in key_points[:5]])}

What are your thoughts on this? Drop a comment below! 👇

#content #blogging #insights #professional"""
    
    # Instagram Caption
    instagram_caption = f"""📱 {title}

{key_points[0] if key_points else 'Great insights ahead!'}

Double tap if you agree! ❤️
Save this for later! 📌

.
.
.
#content #blog #tips #insights #viral #trending"""
    
    # Facebook Post
    facebook_post = f"""📢 {title}

{chr(10).join([f"• {p}" for p in key_points[:3]])}

Read the full article in our bio link! 🔗

What do you think? Let us know in the comments!"""
    
    return {
        "twitter": {
            "thread": twitter_thread,
            "singleTweet": f"{title[:200]}... Read more!"
        },
        "linkedin": linkedin_post,
        "instagram": instagram_caption,
        "facebook": facebook_post
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
        
        # Step 1: Transcribe video (try AssemblyAI first, then Deepgram as fallback)
        transcription_result = transcribe_with_assemblyai(video_path)
        transcript = transcription_result.get('text')
        transcription_warning = None
        
        if not transcription_result.get('success'):
            logger.warning(f"AssemblyAI failed: {transcription_result.get('error')}, trying Deepgram...")
            # Fallback to Deepgram
            transcription_result = transcribe_with_deepgram(video_path)
            transcript = transcription_result.get('text')
            
            if not transcription_result.get('success'):
                transcription_warning = transcription_result.get('error')
                logger.warning(f"Transcription warning: {transcription_warning}")
                if transcription_result.get('mock'):
                    transcript = "Sample transcript (APIs not configured)"
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
        full_blog = {
            "title": blog_data.get("title", "Untitled"),
            "sections": blog_data.get("sections", [])
        }
        
        result = {
            "jobId": job_id,
            "status": "completed",
            "transcript": transcript,
            "blog": full_blog,
            "seo": {
                "title": seo_data.get("title", "Blog Title"),
                "metaDescription": seo_data.get("metaDescription", "Description"),
                "keywords": seo_data.get("keywords", []),
                "seoScore": seo_data.get("seoScore", 75),
                "readabilityScore": seo_data.get("readabilityScore", "Good")
            },
            "imageSuggestions": generate_image_suggestions(blog_data.get("sections", []), blog_data.get("title", "")),
            "socialSnippets": generate_social_snippets(blog_data),
            "availableExports": ["markdown", "html", "wordpress"]
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
    """Get transcript from YouTube with multiple fallback strategies.
    
    Returns: {'success': bool, 'text': str, 'error': str or None}
    """
    logger.info(f"Fetching YouTube transcript for video: {video_id}")
    
    # Strategy 1: Fast direct fetch (youtube-transcript-api)
    try:
        # Try multiple languages
        languages_to_try = [
            ['en', 'en-US', 'en-GB'],
            ['hi', 'hi-IN'],
            ['es', 'fr', 'de', 'pt', 'ru', 'ja', 'ko']
        ]
        
        for langs in languages_to_try:
            try:
                transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=langs)
                full_text = ' '.join([segment['text'] for segment in transcript_data])
                if full_text.strip():
                    logger.info(f"✓ YouTube transcript fetched (API): {len(full_text)} chars")
                    return {'success': True, 'text': full_text, 'error': None}
            except Exception:
                continue
                
    except Exception as e:
        logger.warning(f"Strategy 1 failed: {e}")

    # Strategy 2: yt-dlp (Most Reliable)
    try:
        logger.info("Attempting Strategy 2: yt-dlp...")
        
        # Create temp directory for output
        with tempfile.TemporaryDirectory() as temp_dir:
            output_template = os.path.join(temp_dir, '%(id)s')
            
            # 1. Download subtitles
            cmd = [
                sys.executable, '-m', 'yt_dlp',
                '--write-auto-sub',
                '--write-sub',
                '--sub-lang', 'en,en-US,hi',
                '--skip-download',
                '--output', output_template,
                f'https://www.youtube.com/watch?v={video_id}'
            ]
            
            # Add proxy if configured
            proxy_list = os.getenv('PROXY_LIST', '').split(',')
            proxy_list = [p.strip() for p in proxy_list if p.strip()]
            if proxy_list:
                proxy = random.choice(proxy_list)
                cmd.extend(['--proxy', proxy])
                logger.info(f"Using proxy: {proxy}")
            
            # Run yt-dlp
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                check=False
            )
            
            if result.returncode != 0:
                logger.warning(f"yt-dlp failed: {result.stderr}")
            
            # 2. Parse the downloaded VTT file
            # Check for any .vtt file in the temp dir
            vtt_files = [f for f in os.listdir(temp_dir) if f.endswith('.vtt')]
            
            if vtt_files:
                vtt_path = os.path.join(temp_dir, vtt_files[0])
                logger.info(f"Parsing VTT file: {vtt_path}")
                
                # Simple VTT parser to extract text
                lines = []
                with open(vtt_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        # Skip timestamp lines and metadata
                        if '-->' in line or not line or line.startswith('WEBVTT') or line.startswith('NOTE'):
                            continue
                        # Remove tags like <c.colorE5E5E5>
                        line = re.sub(r'<[^>]+>', '', line)
                        # Avoid duplicates (captions often repeat)
                        if not lines or lines[-1] != line:
                            lines.append(line)
                
                full_text = ' '.join(lines)
                if len(full_text) > 50:
                    logger.info(f"✓ YouTube transcript fetched (yt-dlp): {len(full_text)} chars")
                    return {'success': True, 'text': full_text, 'error': None}
            else:
                logger.warning("No VTT files found after yt-dlp run")

    except Exception as e:
        logger.error(f"Strategy 2 failed: {e}")

    return {
        'success': False, 
        'text': None, 
        'error': 'Failed to fetch transcript. YouTube may be blocking requests or no captions available.'
    }

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
        full_blog = {
            "title": blog_data.get("title", "Untitled"),
            "sections": blog_data.get("sections", [])
        }
        
        result = {
            "jobId": job_id,
            "status": "completed",
            "source": "youtube",
            "videoId": video_id,
            "transcript": transcript,
            "blog": full_blog,
            "seo": {
                "title": seo_data.get("title", "Blog Title"),
                "metaDescription": seo_data.get("metaDescription", "Description"),
                "keywords": seo_data.get("keywords", []),
                "seoScore": seo_data.get("seoScore", 75),
                "readabilityScore": seo_data.get("readabilityScore", "Good")
            },
            "imageSuggestions": generate_image_suggestions(blog_data.get("sections", []), blog_data.get("title", "")),
            "socialSnippets": generate_social_snippets(blog_data),
            "availableExports": ["markdown", "html", "wordpress"]
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
