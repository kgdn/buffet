import subprocess
import os
import time
import cef
from datetime import datetime, timezone, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, set_access_cookies, unset_jwt_cookies, get_jwt_identity, get_jwt
from flask_mail import Message, Mail
from flask_bcrypt import Bcrypt
from models import db, User, UnverifiedUser, BannedUser, VirtualMachine
from helper_functions import HelperFunctions

user_endpoints = Blueprint('user_endpoints', __name__)
Bcrypt = Bcrypt()
mail = Mail()

@user_endpoints.after_request
def refresh_expiring_jwts(response):
    """Refresh the JWT if it is about to expire
    """
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        return response

@user_endpoints.route('/api/user/', methods=['GET'])
@jwt_required()
def get_user_info():
    """Get the user's information

    Returns:
        json: User's information
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Send the user's username
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }), 200


@user_endpoints.route('/api/user/verify/', methods=['GET'])
@jwt_required()
def verify():
    """Verify the user's token

    Returns:
        json: Message
    """

    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('Token verified', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=User.query.filter_by(id=get_jwt_identity()).first().username)

    return jsonify({'message': 'Token verified'}), 200

@user_endpoints.route('/api/user/register/', methods=['POST'])
def register():
    """Register a new user, and send a verification email. 

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Check if the username and password are in the request
    username = data['username']
    email = data['email']
    password = data['password']
     
    # Check if the username is already taken
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 409

    # Check if the email is already taken
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already taken'}), 409

    # Check if the username is already taken in the unverified users table
    if UnverifiedUser.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 409

    # Check if the email is already taken in the unverified users table
    if UnverifiedUser.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already taken'}), 409

    # If everything is valid, create a new user
    new_user = UnverifiedUser(username=username, email=email, password=Bcrypt.generate_password_hash(password).decode('utf-8'))

    # Get the current time and set in DateTime format for database
    created = datetime.now(timezone.utc)
    new_user.created = created

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    # Get the user's id
    new_user_id = new_user.id

    # Send the verification email
    # Format:
    # Hello! You're recieving this email because you created an account on Buffet.
    # Please click <a href="<SERVER_URL>/verify/<USER_ID>/">here</a> to verify your account. (<SERVER_URL> is the URL of the server that should be set in the .env file)
    # 
    # Signature:
    # Buffet is a free and open source student project by <a href="https://kgdn.xyz/">Kieran Gordon</a> at <a href="https://www.hw.ac.uk/">Heriot-Watt University</a>.
    # If you have any questions, please contact me at <a href="mailto:kjg2000@hw.ac.uk">kjg2000@hw</a>.
    msg = Message('Verify your account', sender=(os.environ.get('MAIL_USERNAME')), recipients=[email])
    msg.html = f"""\
    <html>
        <head>
            <style>
                body {{
                    font-family: sans-serif;
                }}
            </style>
        </head>
        <body>
            <p>Hello! You're recieving this email because you created an account on Buffet.</p>
            <p>Please click the link below to verify your account.</p>
            <p><a href="{os.environ.get('SERVER_URL')}/verify/{new_user_id}/">{os.environ.get('SERVER_URL')}/verify/{new_user_id}/</a></p>
            <br>
            <p>Buffet is a free and open source student project by <a href="https://kgdn.xyz/">Kieran Gordon</a> at <a href="https://www.hw.ac.uk/">Heriot-Watt University</a>.</p>
            <p>If you have any questions, please contact me at <a href="mailto:kjg2000@hw.ac.uk">kjg2000@hw.ac.uk</a>.</p>
            <br>
            <p>Thank you!</p>
        </body>
    </html>
    """
    mail.send(msg)

    # Log the user's registration
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User registered', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=new_user.username)

    return jsonify({'message': 'User created. Check your email to verify your account. Please check your spam folder if you do not see the email.'}), 201


@user_endpoints.route('/api/user/verify/<string:id>/', methods=['GET'])
def verify_user(id):
    """Verify the user's account

    Args:
        id (string): The user's id

    Returns:
        json: Message
    """

    # Get the user from the unverified users table
    user = UnverifiedUser.query.filter_by(id=id).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # If the user is already verified, return an error
    if User.query.filter_by(username=user.username).first():
        return jsonify({'message': 'User already verified'}), 409

    # Create a new user with the same information as the unverified user
    new_user = User(username=user.username, email=user.email, password=user.password, role='user')

    # Save the user to the database
    db.session.add(new_user)

    # Delete the unverified user
    db.session.delete(user)

    # Save the changes
    db.session.commit()

    # Log the user's verification
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User verified', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=new_user.username)

    return jsonify({'message': 'Your account has been verified. You can now access the site.'}), 200

@user_endpoints.route('/api/user/login/', methods=['POST'])
def login():
    """Login a user

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400
    
    # Check if the username and password are in the request
    username = data['username']
    password = data['password']

    # Check if the user exists and if the password is correct
    # If the user is found in the banned users table, return an error
    user = User.query.filter_by(username=username).first()
    if not user:
        if BannedUser.query.filter_by(username=username).first():
            return jsonify({'message': 'You were banned for: ' + BannedUser.query.filter_by(username=username).first().ban_reason + '. Please contact the head admin to appeal.'}), 403
        return jsonify({'message': 'Invalid username or password'}), 401
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid password or username'}), 401

    # Get user's login time and set in DateTime format for database
    login_time = datetime.now(timezone.utc)
    user.login_time = login_time

    # Get the user's IP address
    ip_address = request.remote_addr
    user.ip = ip_address

    # Save the user to the database
    db.session.commit()

    # Set access and refresh JWT cookies
    access_token = create_access_token(identity=user.id)
    resp = jsonify({'login': True})
    set_access_cookies(resp, access_token)

    # Log the user's login
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User logged in', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=user.username)

    return resp, 200

@user_endpoints.route('/api/user/logout/', methods=['POST'])
@jwt_required()
def logout():
    """Logout a user

    Returns:
        json: Message
    """

    # Stop VM if the user has one, if not just logout
    vm = VirtualMachine.query.filter_by(user_id=get_jwt_identity()).first()
    if vm:
        try:
            subprocess.Popen(['kill', str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except:
            return jsonify({'message': 'Error deleting virtual machine'}), 500

        db.session.delete(vm)
        db.session.commit()

    # Unset the JWT cookies
    resp = jsonify({'logout': True})
    unset_jwt_cookies(resp)

    # Log the user's logout
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User logged out', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=User.query.filter_by(id=get_jwt_identity()).first().username)

    return resp, 200
    
@user_endpoints.route('/api/user/delete/', methods=['DELETE'])
@jwt_required()
def delete_user():
    """Delete the user account and their virtual machine if they have one

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the password from the request
    data = request.get_json()
    if not data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # If the user is an admin, they cannot delete their account
    if user.role == 'admin':
        return jsonify({'message': 'Admins cannot delete their account, please contact the head admin'}), 403

    password = data['password']

    # Check if the password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid password'}), 401

    # Stop the user's virtual machine
    vm = VirtualMachine.query.filter_by(user_id=user.id).first()
    if vm:
        try:
            subprocess.Popen(['kill', str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except:
            return jsonify({'message': 'Error deleting virtual machine'}), 500

    db.session.delete(user)
    db.session.commit()

    # Log the user's deletion
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User deleted', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=user.username)

    return jsonify({'message': 'User deleted'}), 200

@user_endpoints.route('/api/user/password/', methods=['PUT'])
@jwt_required()
def change_password():
    """Change the password of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the current and new password from the request
    data = request.get_json()
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Check if the current password is correct
    current_password = data['current_password']
    new_password = data['new_password']

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, current_password):
        return jsonify({'message': 'Invalid password'}), 401

    # Change the password
    user.password = Bcrypt.generate_password_hash(new_password).decode('utf-8')

    # Save the user
    db.session.commit()

    # Log the user's password change
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User password changed', 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=user.username)

    return jsonify({'message': 'Password changed'}), 200

@user_endpoints.route('/api/user/username/', methods=['PUT'])
@jwt_required()
def change_username():
    """Change the username of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the new username from the request, and the current password
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    username = data['username']
    password = data['password']

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid password'}), 401

    # Change the username
    user.username = username

    # Save the user
    db.session.commit()

    # Log the user's username change
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User with ID: ' + str(user.id) + ' changed username to ' + username, 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=user.username)

    return jsonify({'message': 'Username changed'}), 200

@user_endpoints.route('/api/user/email/', methods=['PUT'])
@jwt_required()
def change_email():
    """Change the email of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the new email from the request, and the current password
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    email = data['email']
    password = data['password']

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid password'}), 401

    # Change the email
    user.email = email

    # Save the user
    db.session.commit()

    # Log the user's email change
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef('User with ID: ' + str(user.id) + ' changed email to ' + email, 5, request.environ, config={'cef.product': 'Buffet', 'cef.vendor': 'kgdn', 'cef.version': '0', 'cef.device_version': '0.1', 'cef.file': 'logs/' + str(datetime.now().date()) + '/buffet.log'}, username=user.username)

    return jsonify({'message': 'Email changed'}), 200