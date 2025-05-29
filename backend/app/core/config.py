# app/core/config.py
import os

# Load environment variables from .env file
class Config:
    RATELIMIT_DEFAULT = "200 per day, 50 per hour"
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class DevelopmentConfig(Config):
    DEBUG = True
    REDIS_URL = 'redis://localhost:6379'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:9003')
    LOG_LEVEL = 'DEBUG'
    RATELIMIT_STORAGE_URI = REDIS_URL

class ProductionConfig(Config):
    DEBUG = False
    REDIS_URL = 'redis://redis:6379'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://react-frontend:9003')
    RATELIMIT_STORAGE_URI = REDIS_URL

# Config dictionary by environment name
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}