import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'message': 'AI service is running'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/process-video':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                request_data = json.loads(body.decode())
            except:
                request_data = {}

            response = {
                'jobId': request_data.get('jobId', 'mock-123'),
                'status': 'completed',
                'transcript': 'Sample transcript from your video would appear here.',
                'blog': {
                    'title': 'Your Video Topic: Key Insights and Overview',
                    'sections': [
                        {'heading': 'Introduction', 'content': 'This is the introduction section generated from your video content.'},
                        {'heading': 'Main Points', 'content': 'Here are the key points covered in your video.'},
                        {'heading': 'Conclusion', 'content': 'In conclusion, the video discusses important aspects of the topic.'}
                    ]
                },
                'seo': {
                    'title': 'Your Video Topic: Key Insights and Overview',
                    'metaDescription': 'Learn about the key insights from this video presentation.',
                    'keywords': ['topic', 'insights', 'video', 'presentation'],
                    'focusKeyword': 'video content',
                    'readabilityScore': 'Good',
                    'seoScore': 75
                },
                'imageSuggestions': [
                    {'section': 'Introduction', 'prompt': 'Professional introduction header image'},
                    {'section': 'Main Points', 'prompt': 'Infographic showing key points'},
                    {'section': 'Conclusion', 'prompt': 'Conclusion summary graphic'}
                ]
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    print('AI Service Started (Simple)')
    print('Port: 8000')
    print('Status: Running')
    print('')
    print('Endpoints:')
    print('  GET  http://localhost:8000/health')
    print('  POST http://localhost:8000/api/process-video')
    print('')
    print('Press Ctrl+C to stop')
    print('')
    
    server = HTTPServer(('0.0.0.0', 8000), Handler)
    server.serve_forever()
