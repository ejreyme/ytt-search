# app/services/transcript.py
import re
import time
from functools import wraps


from flask import current_app
from fuzzywuzzy import fuzz
from youtube_transcript_api import YouTubeTranscriptApi

def get_youtube_video_id(url):
    """Extract the video ID from a YouTube URL"""
    try:
        # Try to handle it as a URL
        from urllib.parse import urlparse, parse_qs

        # Check if it's already just a video ID (11-12 characters, alphanumeric + '_', '-')
        if re.match(r'^[A-Za-z0-9_-]{11,12}$', url):
            return url

        # Parse URL
        parsed_url = urlparse(url)

        # Handle youtube.com URLs
        if 'youtube.com' in parsed_url.netloc:
            query_params = parse_qs(parsed_url.query)
            if 'v' in query_params:
                return query_params['v'][0]

        # Handle youtu.be URLs
        elif 'youtu.be' in parsed_url.netloc:
            # The path contains the video ID for youtu.be URLs
            video_id = parsed_url.path.lstrip('/')
            return video_id

        # No valid YouTube video ID found
        raise ValueError("Invalid YouTube URL format")

    except Exception as e:
        current_app.logger.error(f"Error extracting video ID: {str(e)}")
        raise ValueError(f"Failed to extract YouTube video ID: {str(e)}")

def retry_on_error(max_retries=3, initial_delay=1):
    """
    Decorator that retries a function when it raises an exception.

    Args:
        max_retries: Maximum number of attempts before giving up
        initial_delay: Initial delay between attempts in seconds
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            current_delay = initial_delay

            while attempts < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts == max_retries:
                        raise

                    print(f"Attempt {attempts} failed: {str(e)}. Retrying in {current_delay} seconds...")
                    time.sleep(current_delay)
                    current_delay *= 2  # Exponential backoff
            return None

        return wrapper
    return decorator

@retry_on_error(max_retries=3, initial_delay=1)
def search_transcript_fuzzy(video_id, query, language='en', threshold=80):
    """
    Search through YouTube transcript using fuzzy matching with support for multiple languages.

    Args:
        video_id (str): YouTube video ID
        query (str): The search query
        language (str): Preferred language code (default: 'en')
        threshold (int): Similarity threshold (0-100)

    Returns:
        list: Matching segments or dict with error message
    """
    try:
        # Create an instance of YouTubeTranscriptApi
        api = YouTubeTranscriptApi()

        # Try to get available transcript languages
        # transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript_list = api.list(video_id)

        # Find available languages
        available_languages = [t.language_code for t in transcript_list]
        current_app.logger.info(f"Available transcript languages for video {video_id}: {available_languages}")

        # Check if requested language is available
        transcript = None
        used_language = None

        if language in available_languages:
            # Use requested language
            transcript = api.fetch(video_id, languages=[language])
            used_language = language
            current_app.logger.info(f"Using requested language: {language}")
        elif 'en' in available_languages:
            # Fallback to English
            transcript = api.fetch(video_id, languages=['en'])
            used_language = 'en'
            current_app.logger.warning(f"Language '{language}' not available, falling back to English")
        elif available_languages:
            # Use first available language as last resort
            fallback_lang = available_languages[0]
            transcript = api.fetch(video_id, languages=[fallback_lang])
            used_language = fallback_lang
            current_app.logger.warning(f"Using first available language: {fallback_lang}")
        else:
            return {"error": "No transcripts available for this video"}

        # Convert query to lowercase for case-insensitive matching
        query = query.lower()

        # Store matches
        matches = []

        # Search through each segment with fuzzy matching
        for segment in transcript:
            text = segment.text.lower()
            # Calculate similarity score (0-100)
            similarity = fuzz.partial_ratio(query, text)
            if similarity >= threshold:
                matches.append({
                    'start': segment.start,
                    'text': segment.text,
                    'duration': segment.duration,
                    'similarity': similarity,
                    'language': used_language,
                    'link': f'https://youtube.com/watch?v={video_id}&t={int(segment.start)}'
                })


        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x['similarity'], reverse=True)

        # Format timestamps for better readability
        for match in matches:
            start_seconds = int(match['start'])
            start_minutes, start_seconds = divmod(start_seconds, 60)
            start_hours, start_minutes = divmod(start_minutes, 60)
            match['timestamp'] = f"{start_hours:02d}:{start_minutes:02d}:{start_seconds:02d}"

        # Add metadata about the search
        result = {
            'matches': matches,
            'metadata': {
                'query': query,
                'threshold': threshold,
                'requested_language': language,
                'used_language': used_language,
                'available_languages': available_languages,
                'match_count': len(matches)
            }
        }

        current_app.logger.info(f"Found {len(matches)} matches for query '{query}' with threshold {threshold}")

        return result

    except Exception as e:
        error_message = str(e)
        current_app.logger.error(f"Error searching transcript: {error_message}")

        # Return descriptive error messages for common issues
        if "No transcript found" in error_message:
            return {"error": "No transcript available for this video"}
        elif "not in list of available languages" in error_message:
            return {"error": f"Language '{language}' is not available for this video"}
        elif "Video unavailable" in error_message:
            return {"error": "This video is unavailable or private"}
        else:
            return {"error": f"Error retrieving transcript: {error_message}"}