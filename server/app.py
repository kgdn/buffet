import os
from asyncio import sleep
from datetime import datetime
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from config import ApplicationConfig
from models import db
from werkzeug.middleware.proxy_fix import ProxyFix
from routes.user_endpoints import user_endpoints
from routes.vm_endpoints import vm_endpoints
from routes.admin_endpoints import admin_endpoints

# Create Flask app
app = Flask(__name__) # __name__ is the name of the current Python module
app.config.from_object(ApplicationConfig) # Load config from config.py
CORS(app, supports_credentials=True) # Enable CORS for all routes
Bcrypt = Bcrypt(app) # Initialize Bcrypt for password hashing
jwt = JWTManager(app) # Initialize JWT for authentication
db.init_app(app) # Initialize database connection
mail = Mail(app) # Initialize Mail for sending emails
migrate = Migrate(app, db) # Initialize Migrate for database migrations

# Create database tables
with app.app_context():
    db.create_all()

# Register blueprints
app.register_blueprint(user_endpoints)
app.register_blueprint(vm_endpoints)
app.register_blueprint(admin_endpoints)

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Create logs/ directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

# Create iso/ directory if it doesn't exist
if not os.path.exists('iso'):
    os.makedirs('iso')

# Create iso/logos/ directory if it doesn't exist
if not os.path.exists('iso/logos'):
    os.makedirs('iso/logos')

# Create iso/index.json if it doesn't exist
if not os.path.exists('iso/index.json'):
    open('iso/index.json', 'a').close()

# Create logs/ directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

if __name__ == '__main__':
    app.run()