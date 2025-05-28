# app/services/transcript.py
import re

from flask import current_app
from fuzzywuzzy import fuzz
from youtube_transcript_api import YouTubeTranscriptApi

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
        # Try to get available transcript languages
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # Find available languages
        available_languages = [t.language_code for t in transcript_list]
        current_app.logger.info(f"Available transcript languages for video {video_id}: {available_languages}")

        # Check if requested language is available
        transcript = None
        used_language = None

        if language in available_languages:
            # Use requested language
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])
            used_language = language
            current_app.logger.info(f"Using requested language: {language}")
        elif 'en' in available_languages:
            # Fallback to English
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            used_language = 'en'
            current_app.logger.warning(f"Language '{language}' not available, falling back to English")
        elif available_languages:
            # Use first available language as last resort
            fallback_lang = available_languages[0]
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[fallback_lang])
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
            text = segment['text'].lower()
            # Calculate similarity score (0-100)
            similarity = fuzz.partial_ratio(query, text)
            if similarity >= threshold:
                matches.append({
                    'start': segment['start'],
                    'text': segment['text'],
                    'duration': segment['duration'],
                    'similarity': similarity,
                    'language': used_language,  # Include the language used
                    'link': f'https://youtube.com/watch?v={video_id}&t={int(segment["start"])}'
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

