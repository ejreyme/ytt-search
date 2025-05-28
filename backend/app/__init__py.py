# app/__init__.py
from flask import Flask

from app.api.__init__py import api_bp
from app.core.config import config_by_name
from app.core.extensions import init_extensions


def create_app(config_name='development'):

    """Application factory pattern"""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    init_extensions(app)

    # Register blueprints
    app.register_blueprint(api_bp)

    return app
