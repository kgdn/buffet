# models.py - Contains the database models for the server.
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

import random
import string
from uuid import uuid4

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def generate_uuid():
    """Generates a random UUID (universally unique identifier) and returns it as a string.

    Returns:
        str: A random UUID as a string.
    """
    return uuid4().hex


def generate_unique_code():
    """Generates a random 6-character alphanumeric code and returns it as a string.

    Returns:
        str: A random 6-character alphanumeric code as a string.
    """
    return "".join(random.choices(string.ascii_letters + string.digits, k=6))


class UnverifiedUsers(db.Model):
    """Contains the database model for an unverified user.

    Args:
        db (SQLAlchemy): The SQLAlchemy object.
    """

    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    created = db.Column(db.DateTime, nullable=False)
    unique_code = db.Column(db.String(6), nullable=False, default=generate_unique_code)


class Users(db.Model):
    """Contains the database model for a user.

    Args:
        db (SQLAlchemy): The SQLAlchemy object.
    """

    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False)
    two_factor_enabled = db.Column(db.Boolean, nullable=False, default=False)
    two_factor_secret = db.Column(db.String(80), nullable=True)
    hard_drives = db.relationship("VirtualMachines", backref="user", lazy=True, primaryjoin="Users.id == VirtualMachines.user_id")


class BannedUsers(db.Model):
    """Contains the database model for a banned user. You can move data from the User table to this table when a user is banned.

    Args:
        db (SQLAlchemy): The SQLAlchemy object.
    """

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey("users.id"), nullable=False)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False)
    two_factor_enabled = db.Column(db.Boolean, nullable=False, default=False)
    two_factor_secret = db.Column(db.String(80), nullable=True)
    ban_reason = db.Column(db.String(80), nullable=True)


class VirtualMachines(db.Model):
    """Contains the database model for a virtual machine.

    Args:
        db (SQLAlchemy): The SQLAlchemy object.
    """

    id = db.Column(db.Integer, primary_key=True)
    port = db.Column(db.Integer, nullable=False)
    wsport = db.Column(db.Integer, nullable=False)
    iso = db.Column(db.String(80), nullable=False)
    websockify_process_id = db.Column(db.Integer, nullable=False)
    process_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.String(32), db.ForeignKey("users.id"), nullable=False)
    log_file = db.Column(db.String(80), nullable=False)
    vnc_password = db.Column(db.String(80), nullable=True)
    hard_drive = db.Column(db.String(80), nullable=True)


class ApplicationConfigDb(db.Model):
    """Contains the configuration for the server. This overrides the .env file. Modify the values in the database to change the configuration."""

    id = db.Column(db.Integer, primary_key=True)
    API_URL = db.Column(db.String(255), nullable=True)
    CLIENT_URL = db.Column(db.String(255), nullable=True)
    CORS_HEADERS = db.Column(db.String(255), nullable=True)

    GUNICORN_ACCESS_LOG = db.Column(db.String(255), nullable=True)
    GUNICORN_BIND_ADDRESS = db.Column(db.String(255), nullable=True)
    GUNICORN_ERROR_LOG = db.Column(db.String(255), nullable=True)
    GUNICORN_LOG_LEVEL = db.Column(db.String(255), nullable=True)
    GUNICORN_WORKER_CLASS = db.Column(db.String(255), nullable=True)

    ISO_DIR = db.Column(db.String(255), nullable=True)

    JWT_ACCESS_TOKEN_EXPIRES = db.Column(db.Interval, nullable=True)
    JWT_COOKIE_CSRF_PROTECT = db.Column(db.Boolean, nullable=True)
    JWT_COOKIE_SECURE = db.Column(db.Boolean, nullable=True)
    JWT_REFRESH_TOKEN_EXPIRES = db.Column(db.Interval, nullable=True)
    JWT_SECRET_KEY = db.Column(db.String(255), nullable=True)
    JWT_TOKEN_LOCATION = db.Column(db.String(255), nullable=True)

    KVM_ENABLED = db.Column(db.Boolean, nullable=True)

    MAIL_ASCII_ATTACHMENTS = db.Column(db.Boolean, nullable=True)
    MAIL_DEFAULT_SENDER = db.Column(db.String(255), nullable=True)
    MAIL_MAX_EMAILS = db.Column(db.Integer, nullable=True)
    MAIL_PASSWORD = db.Column(db.String(255), nullable=True)
    MAIL_PORT = db.Column(db.Integer, nullable=True)
    MAIL_SERVER = db.Column(db.String(255), nullable=True)
    MAIL_USE_SSL = db.Column(db.Boolean, nullable=True)
    MAIL_USE_TLS = db.Column(db.Boolean, nullable=True)
    MAIL_USERNAME = db.Column(db.String(255), nullable=True)

    MAX_VM_CORES = db.Column(db.Integer, nullable=True)
    MAX_VM_COUNT = db.Column(db.Integer, nullable=True)
    MAX_VM_MEMORY = db.Column(db.Integer, nullable=True)

    SECRET_KEY = db.Column(db.String(255), nullable=True)

    SQLALCHEMY_DATABASE_URI = db.Column(db.String(255), nullable=True)
    SQLALCHEMY_ECHO = db.Column(db.Boolean, nullable=True)
    SQLALCHEMY_TRACK_MODIFICATIONS = db.Column(db.Boolean, nullable=True)

    SSL_CERTIFICATE_PATH = db.Column(db.String(255), nullable=True)
    SSL_ENABLED = db.Column(db.Boolean, nullable=True)
    SSL_KEY_PATH = db.Column(db.String(255), nullable=True)

    RATE_LIMIT = db.Column(db.String(255), nullable=True)

    VM_PORT_START = db.Column(db.Integer, nullable=True)
    WEBSOCKET_PORT_START = db.Column(db.Integer, nullable=True)
