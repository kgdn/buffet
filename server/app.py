# app.py - Main application file for the server.
# Copyright (C) 2024, Kieran Gordon
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
import atexit
import os
import subprocess

from config import ApplicationConfig
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_mail import Mail
from flask_migrate import Migrate
from models import VirtualMachine, db
from routes.admin_endpoints import admin_endpoints
from routes.user_endpoints import user_endpoints
from routes.vm_endpoints import vm_endpoints
from werkzeug.middleware.proxy_fix import ProxyFix

# Create Flask app
app = Flask(__name__)  # __name__ is the name of the current Python module
app.config.from_object(ApplicationConfig)  # Load config from config.py
CORS(app, supports_credentials=True)  # Enable CORS for all routes
Bcrypt = Bcrypt(app)  # Initialize Bcrypt for password hashing
jwt = JWTManager(app)  # Initialize JWT for authentication
db.init_app(app)  # Initialize database connection
mail = Mail(app)  # Initialize Mail for sending emails
migrate = Migrate(app, db)  # Initialize Migrate for database migrations
limiter = Limiter(app)

# Rate limiting
limiter.limit("100 per minute")(user_endpoints)
limiter.limit("100 per minute")(vm_endpoints)
limiter.limit("100 per minute")(admin_endpoints)

# Create database tables
with app.app_context():
    db.create_all()

# Register blueprints
app.register_blueprint(user_endpoints)
app.register_blueprint(vm_endpoints)
app.register_blueprint(admin_endpoints)

app.wsgi_app = ProxyFix(
    app.wsgi_app, x_proto=1, x_host=1
)  # Gunicorn gets confused if it doesn't know that it's behind a proxy, so we need to tell it that it is

# Create logs/ directory if it doesn't exist
if not os.path.exists("logs"):
    os.makedirs("logs")

# Create iso/ directory if it doesn't exist
if not os.path.exists("iso"):
    os.makedirs("iso")

# Create iso/logos/ directory if it doesn't exist
if not os.path.exists("iso/logos"):
    os.makedirs("iso/logos")

# Create iso/index.json if it doesn't exist
if not os.path.exists("iso/index.json"):
    with open("iso/index.json", "a", encoding="utf-8") as f:
        f.write("[]")

# Create logs/ directory if it doesn't exist
if not os.path.exists("logs"):
    os.makedirs("logs")


# On exit, clean up any leftover virtual machines
def clean_up():
    """Cleans up any leftover virtual machines on exit."""
    with app.app_context():
        vms = VirtualMachine.query.all()
        for vm in vms:
            subprocess.Popen(
                ["kill", str(vm.websockify_process_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            subprocess.Popen(
                ["kill", str(vm.process_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            db.session.delete(vm)
            db.session.commit()


atexit.register(clean_up)

if __name__ == "__main__":
    app.run()
