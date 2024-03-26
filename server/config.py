from dotenv import load_dotenv
from datetime import timedelta
import os 

load_dotenv()

class ApplicationConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY') # Secret key

    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI') # Database URI
    SQLALCHEMY_TRACK_MODIFICATIONS = os.environ.get('SQLALCHEMY_TRACK_MODIFICATIONS') # Track modifications
    SQLALCHEMY_ECHO = os.environ.get('SQLALCHEMY_ECHO') # Echo SQL queries to the console

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') # Secret key
    JWT_COOKIE_CSRF_PROTECT = os.environ.get('JWT_COOKIE_CSRF_PROTECT') # CSRF protection
    JWT_COOKIE_SECURE = os.environ.get('JWT_COOKIE_SECURE') # Secure cookies
    JWT_TOKEN_LOCATION = os.environ.get('JWT_TOKEN_LOCATION') # Token location, i.e. cookies
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES'))) # Access token expiration time
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES'))) # Refresh token expiration time
    CORS_HEADERS = os.environ.get('CORS_HEADERS')

    MAIL_SERVER = os.environ.get('MAIL_SERVER') # Mail server
    MAIL_PORT = os.environ.get('MAIL_PORT') # Mail server port
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') # Mail server username
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') # Mail server password
    MAIL_DEFAULT_SENDER= os.environ.get('MAIL_DEFAULT_SENDER') # Default sender
    MAIL_MAX_EMAILS = os.environ.get('MAIL_MAX_EMAILS') # Maximum number of emails to send
    MAIL_ASCII_ATTACHMENTS = os.environ.get('MAIL_ASCII_ATTACHMENTS') # Attachments
