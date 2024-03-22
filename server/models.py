import random
import string
from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def generate_uuid():
    """Generates a random UUID (universally unique identifier) and returns it as a string.

    Returns:
        str: A random UUID as a string.
    """
    return uuid4().hex

def generate_unique_code():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

class UnverifiedUser(db.Model):
    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    created = db.Column(db.DateTime, nullable=False)
    unique_code = db.Column(db.String(6), nullable=False, default=generate_unique_code)

class User(db.Model):
    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False)

class BannedUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), nullable=False)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False)
    ban_reason = db.Column(db.String(80), nullable=True)

class VirtualMachine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    port = db.Column(db.Integer, nullable=False)
    wsport = db.Column(db.Integer, nullable=False)
    iso = db.Column(db.String(80), nullable=False)
    process_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), nullable=False)
    log_file = db.Column(db.String(80), nullable=False)