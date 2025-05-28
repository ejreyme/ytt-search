from flask import current_app
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis

from flask_caching import Cache

# Initialize extensions
cors = CORS()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

cache = Cache()

def init_extensions(app):
    """Initialize all extensions with the app instance"""
    cors.init_app(app)

    # Configure limiter with Redis
    limiter.storage_uri = app.config['REDIS_URL']
    limiter.init_app(app)

    # Configure cache
    cache_config = {
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_URL': app.config['REDIS_URL']
    }
    cache.init_app(app, config=cache_config)