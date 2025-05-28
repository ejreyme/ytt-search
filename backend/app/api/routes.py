# app/api/routes.py
from flask import jsonify, request, current_app
from flask_cors import cross_origin
from flask_limiter import RateLimitExceeded

from app.api.__init__py import api_bp
from app.core.extensions import limiter
from app.services.transcript import search_transcript_fuzzy, get_youtube_video_id

@api_bp.route('/search', methods=['GET'])
@limiter.limit("5 per second")
@cross_origin()
def search():
    try:
        yt_link_input = request.args.get('video_id')
        query = request.args.get('query')
        language = request.args.get('language', 'en')
        threshold = int(request.args.get('threshold', 80))

        if not yt_link_input or not query:
            return jsonify({"error": "Missing video_url or query"}), 400

        try:
            video_id = get_youtube_video_id(yt_link_input)
        except ValueError as e:
            current_app.logger.error(f"Invalid YouTube URL: {yt_link_input}")
            return jsonify({"error": str(e)}), 400

        current_app.logger.info(f"video_id: {video_id}, query: {query}, language: {language}, threshold: {threshold}")

        if not video_id:
            return jsonify({"error": "Could not extract video ID"}), 400

        results = search_transcript_fuzzy(video_id, query, language, threshold)

        # Check if results is an error dictionary
        if isinstance(results, dict) and "error" in results:
            error_message = results["error"]
            current_app.logger.error(f"Search error: {error_message}")
            return jsonify({"error": error_message}), 500

        # Return the results, which now include metadata
        return jsonify(results)

    except Exception as e:
        current_app.logger.exception("Unexpected error in search endpoint")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@api_bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@api_bp.errorhandler(RateLimitExceeded)
def handle_rate_limit_exceeded(e):
    return jsonify(error="Too many requests, please slow down!"), 429