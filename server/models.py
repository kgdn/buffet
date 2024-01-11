from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def generate_uuid():
    return uuid4().hex

class UnverifiedUser(db.Model):
    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False)

class User(db.Model):
    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False)

# Move banned users to a separate table
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