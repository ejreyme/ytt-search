import redis
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from flask_caching import Cache

limiter = Limiter(key_func=get_remote_address)

def init_redis(app):
    # Configure redis
    redis_url = app.config['REDIS_URL']
    connection = redis.StrictRedis.from_url(redis_url)
    return connection

# Initialize extensions
def init_extensions(app):
    print_config(app)
    # Configure cache
    cache_config = {
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_URL': app.config['REDIS_URL']
    }
    Cache(app, config=cache_config)

    limiter.init_app(app)

def print_config(app):
    print(app.config['DEBUG'])
    print(app.config['REDIS_URL'])
    print(app.config['RATELIMIT_DEFAULT'])
    print(app.config['CORS_ORIGINS'])
    print(app.config['LOG_LEVEL'])