# wsgi.py
import os

from app.__init__py import create_app

# Get environment from environment variable or default to development
env = os.getenv('FLASK_ENV', 'development')
# env = os.getenv('FLASK_ENV', 'production')


app = create_app(env)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 9005)))