# app/__init__.py

from flask import Flask
from flask_cors import CORS

from app.api.__init__py import api_bp
from app.core.config import config_by_name
from app.core.extensions import init_extensions, init_redis


def create_app(config_name):
    app = Flask(__name__)
    # Configure cors
    CORS(app, resources={r"/*": {"origins": "*"}})
    # Load configuration
    app.config.from_object(config_by_name[config_name])

    redis = init_redis(app)
    app.redis = redis

    # Initialize extensions
    init_extensions(app)

    # Register blueprints
    app.register_blueprint(api_bp)

    return app