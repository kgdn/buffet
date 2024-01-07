from dotenv import load_dotenv
from datetime import timedelta
import os 

load_dotenv()

class ApplicationConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')

    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite3'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_COOKIE_SECURE = False # Set to True in production
    JWT_TOKEN_LOCATION = 'cookies'
    JWT_ACCESS_LIFESPAN = {'hours': 24}
    JWT_REFRESH_LIFESPAN = {'days': 30}
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    CORS_HEADERS = 'Content-Type'