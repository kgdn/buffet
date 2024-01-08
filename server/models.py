from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def generate_uuid():
    return uuid4().hex

class User(db.Model):
    # id is uuid, username is unique, password is hashed
    id = db.Column(db.String(32), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(80), nullable=False) # admin or user

class VirtualMachine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    port = db.Column(db.Integer, nullable=False)
    wsport = db.Column(db.Integer, nullable=False)
    iso = db.Column(db.String(80), nullable=False)
    process_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), nullable=False)