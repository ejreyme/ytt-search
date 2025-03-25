import re

from youtube_transcript_api import YouTubeTranscriptApi
from fuzzywuzzy import fuzz
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_limiter.errors import RateLimitExceeded
import redis

# Redis connection (using the URL from environment variable)
redis_url = "redis://redis:6379"  # Use 'redis' hostname defined in docker-compose.yml
redis_connection = redis.StrictRedis.from_url(redis_url)


def get_youtube_video_id(yt_link_input):
    try:
        # Use a regex to validate YouTube URL
        youtube_url_pattern = re.compile(
            r"(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+"
        )
        if not youtube_url_pattern.match(yt_link_input):
            raise ValueError("Invalid YouTube URL")

        # Extract the video ID
        if 'v=' in yt_link_input:
            part_one = yt_link_input.split("v=")[1]
            video_id = part_one.split("&")[0]
        elif 'youtu.be/' in yt_link_input:
            video_id = yt_link_input.split("youtu.be/")[1].split("?")[0]

        # Return the extracted video ID
        return video_id
    except Exception as e:
        raise ValueError(f"Could not extract video ID: {str(e)}")
def search_transcript_fuzzy(video_id, query, language='en', threshold=80):
    try:
        # Fetch the transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])

        # Convert query to lowercase
        query = query.lower()

        # Store matches
        matches = []

        # Search through each segment with fuzzy matching
        for segment in transcript:
            text = segment['text'].lower()
            # Calculate similarity score (0-100)
            similarity = fuzz.partial_ratio(query, text)
            if similarity >= threshold:  # Adjust threshold as needed
                matches.append({
                    'start': segment['start'],
                    'text': segment['text'],
                    'duration': segment['duration'], # this needs to be hh:mm:ss
                    'similarity': similarity,
                    'link': f'https://youtube.com/watch?v={video_id}&t={int(segment["start"])}'
                })

        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x['similarity'], reverse=True)

        # Return results
        if matches:
            for match in matches:
                print(f"[{match['start']:.2f}s - {match['start'] + match['duration']:.2f}s] "
                      f"{match['text']} (Similarity: {match['similarity']}%)"
                      f"(link: https://youtube.com/watch?v={video_id}&t={int(match['start'])})")
            return matches
        else:
            print(f"No matches found for '{query}' with threshold {threshold}%")
            return []

    except Exception as e:
        print(f"Error: {e}")
        return []

app = Flask(__name__)
app.config['DEBUG'] = False
cors = CORS(app)
# cors = CORS(app, resources={r"/*": {"origins": "http://react-frontend:80"}}) # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'

# Initialize Flask-Limiter
limiter = Limiter(
    key_func=get_remote_address,  # Use IP Address for limiting (default)
    storage_uri=redis_url,  # Use Redis for rate limit storage
    app=app,
    # default_limits=["200 per day", "50 per hour"]  # Global default limits
)

@app.route('/search', methods=['GET'])
@limiter.limit("5 per second")  # Custom limit
@cross_origin()
def search():
    yt_link_input = request.args.get('video_id')
    query = request.args.get('query')
    language = request.args.get('language', 'en')
    threshold = int(request.args.get('threshold', 80))

    if not yt_link_input or not query:
        return jsonify({"error": "Missing video_url or query"}), 400

    try:
        video_id = get_youtube_video_id(yt_link_input)
    except ValueError as e:
        app.logger.error(f"Invalid YouTube URL: {yt_link_input}")
        return jsonify({"error": str(e)}), 400

    app.logger.info(f"video_id: {video_id}, query: {query}, language: {language}, threshold: {threshold}")

    if not video_id or not query:
        return jsonify({"error": "Missing video_id or query"}), 400

    results = search_transcript_fuzzy(video_id, query, language, threshold)
    if isinstance(results, dict) and "error" in results:
        return jsonify(results), 500
    return jsonify(results)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.errorhandler(RateLimitExceeded)
def handle_rate_limit_exceeded(e):
    return jsonify(error="Too many requests, please slow down!"), 429

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9003)