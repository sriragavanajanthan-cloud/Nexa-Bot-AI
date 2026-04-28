
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

PIXABAY_API_KEY = "55575290-329752efa37512543a3df3950"

@app.route('/search', methods=['GET'])
def search_videos():
    """Search for videos on Pixabay"""
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "No search query provided"}), 400
    
    try:
        # per_page must be between 3 and 200
        url = f"https://pixabay.com/api/videos/?key={PIXABAY_API_KEY}&q={query}&per_page=12&video_type=film"
        response = requests.get(url)
        data = response.json()
        
        videos = []
        for hit in data.get("hits", []):
            # Get the best available quality
            video_data = hit.get("videos", {})
            video_url = None
            width = 0
            height = 0
            
            # Try to get medium quality first, then small
            if "medium" in video_data:
                video_url = video_data["medium"]["url"]
                width = video_data["medium"].get("width", 0)
                height = video_data["medium"].get("height", 0)
            elif "small" in video_data:
                video_url = video_data["small"]["url"]
                width = video_data["small"].get("width", 0)
                height = video_data["small"].get("height", 0)
            
            if video_url:
                videos.append({
                    "url": video_url,
                    "duration": hit.get("duration", 0),
                    "width": width,
                    "height": height,
                    "thumbnail": hit.get("videos", {}).get("small", {}).get("thumbnail", "")
                })
        
        return jsonify({"videos": videos, "total": len(videos)})
    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/assemble', methods=['POST'])
def assemble_video():
    """Generate/assemble a video from a topic"""
    try:
        data = request.json
        topic = data.get('topic')
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400
        
        # Search for a video related to the topic
        url = f"https://pixabay.com/api/videos/?key={PIXABAY_API_KEY}&q={topic}&per_page=3&video_type=film"
        response = requests.get(url)
        result = response.json()
        
        if result.get("hits") and len(result["hits"]) > 0:
            video = result["hits"][0]
            video_url = video["videos"].get("medium", {}).get("url") or video["videos"].get("small", {}).get("url")
            
            return jsonify({
                "video_url": video_url,
                "duration": video.get("duration", 0),
                "message": f"Found video for: {topic}"
            })
        else:
            return jsonify({"error": "No videos found for this topic"}), 404
            
    except Exception as e:
        print(f"Assemble error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Video Studio API is running"})

if __name__ == '__main__':
    print("🎬 AI Video Studio Backend Server")
    print(f"   Pixabay API Key: {PIXABAY_API_KEY[:10]}...")
    print("   Endpoints:")
    print("     GET  /search?q=keyword  - Search for videos")
    print("     POST /assemble          - Generate video from topic")
    print("     GET  /health            - Health check")
    app.run(port=5001, debug=True)