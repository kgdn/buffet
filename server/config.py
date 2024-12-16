# config.py - Contains the configuration for the server. Modify the values in the .env file to change the configuration.
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

import os
from datetime import timedelta
from models import ApplicationConfigDb, db
from dotenv import load_dotenv

load_dotenv()


class ApplicationConfig:
    """Contains the configuration for the server. Modify the values in the .env file to change the configuration.
    Overridden by the ApplicationConfigDb table in the database.
    """

    CLIENT_URL = os.environ.get("CLIENT_URL")  # Front-end address
    CORS_HEADERS = os.environ.get("CORS_HEADERS")

    GUNICORN_ACCESS_LOG = os.environ.get("GUNICORN_ACCESS_LOG")  # Gunicorn access log
    GUNICORN_BIND_ADDRESS = os.environ.get("GUNICORN_BIND_ADDRESS")  # Gunicorn bind address
    GUNICORN_ERROR_LOG = os.environ.get("GUNICORN_ERROR_LOG")  # Gunicorn error log
    GUNICORN_LOG_LEVEL = os.environ.get("GUNICORN_LOG_LEVEL")  # Gunicorn log level
    GUNICORN_WORKER_CLASS = os.environ.get("GUNICORN_WORKER_CLASS")  # Gunicorn worker class

    ISO_DIR = os.environ.get("ISO_DIR")  # ISO path

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES")))  # Access token expiration time
    JWT_COOKIE_CSRF_PROTECT = os.environ.get("JWT_COOKIE_CSRF_PROTECT")  # CSRF protection
    JWT_COOKIE_SECURE = os.environ.get("JWT_COOKIE_SECURE")  # Secure cookies
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES")))  # Refresh token expiration time
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")  # Secret key
    JWT_TOKEN_LOCATION = os.environ.get("JWT_TOKEN_LOCATION")  # Token location, i.e. cookies

    KVM_ENABLED = os.environ.get("KVM_ENABLED")  # KVM enabled

    LOG_DIR = os.environ.get("LOG_DIR")  # Log directory

    MAIL_ASCII_ATTACHMENTS = os.environ.get("MAIL_ASCII_ATTACHMENTS")  # Attachments
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")  # Default sender
    MAIL_MAX_EMAILS = os.environ.get("MAIL_MAX_EMAILS")  # Maximum number of emails to send
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")  # Mail server password
    MAIL_PORT = os.environ.get("MAIL_PORT")  # Mail server port
    MAIL_SERVER = os.environ.get("MAIL_SERVER")  # Mail server
    MAIL_USE_SSL = False
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")  # Mail server username

    MAX_VM_CORES = os.environ.get("MAX_VM_CORES")  # Maximum CPU core count for virtual machines
    MAX_VM_COUNT = os.environ.get("MAX_VM_COUNT")  # Maximum number of virtual machines
    MAX_VM_MEMORY = os.environ.get("MAX_VM_MEMORY")  # Maximum memory for virtual machines

    SECRET_KEY = os.environ.get("SECRET_KEY")  # Secret key

    SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI")  # Database URI
    SQLALCHEMY_ECHO = os.environ.get("SQLALCHEMY_ECHO")  # Echo SQL queries to the console
    SQLALCHEMY_TRACK_MODIFICATIONS = os.environ.get("SQLALCHEMY_TRACK_MODIFICATIONS")  # Track modifications

    SSL_CERTIFICATE_PATH = os.environ.get("SSL_CERTIFICATE_PATH")  # Certificate path
    SSL_ENABLED = os.environ.get("SSL_ENABLED")  # SSL enabled
    SSL_KEY_PATH = os.environ.get("SSL_KEY_PATH")  # Key path

    RATE_LIMIT = os.environ.get("RATE_LIMIT")  # Rate limit

    LDAP_ENABLED = os.environ.get("LDAP_ENABLED")  # LDAP enabled
    LDAP_HOST = os.environ.get("LDAP_HOST")  # LDAP host
    LDAP_BASE_DN = os.environ.get("LDAP_BASE_DN")  # LDAP base DN
    LDAP_USER_DN = os.environ.get("LDAP_USER_DN")  # LDAP user DN
    LDAP_GROUP_DN = os.environ.get("LDAP_GROUP_DN")  # LDAP group DN
    LDAP_USER_RDN_ATTR = os.environ.get("LDAP_USER_RDN_ATTR")  # LDAP user RDN attribute
    LDAP_USER_LOGIN_ATTR = os.environ.get("LDAP_USER_LOGIN_ATTR")  # LDAP user login attribute
    LDAP_BIND_USER_DN = os.environ.get("LDAP_BIND_USER_DN")  # LDAP bind user DN
    LDAP_BIND_USER_PASSWORD = os.environ.get("LDAP_BIND_USER_PASSWORD")  # LDAP bind user password

    VM_PORT_START = os.environ.get("VM_PORT_START")  # Starting port for virtual machines
    WEBSOCKET_PORT_START = os.environ.get("WEBSOCKET_PORT_START")  # Starting port for websockets

    @staticmethod
    def get_config():
        for key, value in ApplicationConfig.__dict__.items():
            if not key.startswith("__") and not callable(value):
                ApplicationConfig.__dict__[key] = os.environ.get(key)


def override_config_with_db(app):
    """Override environment variables with database entries if they exist."""
    with app.app_context():
        config_entries = db.session.query(ApplicationConfigDb).all()
        for entry in config_entries:
            if entry.key in os.environ:
                os.environ[entry.key] = entry.value
