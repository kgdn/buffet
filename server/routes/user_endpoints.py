# user_endpoints.py - Contains the admin endpoints for the server.
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

import base64
import os
import re
import subprocess
from datetime import datetime, timedelta, timezone

import pyotp
import qrcode
from flask import Blueprint, jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)
from flask_mail import Mail, Message
from flask_ldap3_login import LDAP3LoginManager
from flask_ldap3_login.forms import LDAPLoginForm
from config import ApplicationConfig
from models import BannedUsers, UnverifiedUsers, Users, VirtualMachines, db
from password_strength import PasswordPolicy

user_endpoints = Blueprint("user_endpoints", __name__)
Bcrypt = Bcrypt()
mail = Mail()
ldap_manager = LDAP3LoginManager()


@user_endpoints.after_request
def refresh_expiring_jwts(response):
    """Refresh the JWT if it is about to expire"""
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


def is_valid_username(username):
    """Check if the username is valid

    Args:
        username (str): The username to check

    Returns:
        bool: If the username is valid
    """

    return re.match("^[a-zA-Z0-9_-]+$", username)


def is_valid_email(email):
    """Check if the email is valid

    Args:
        email (str): The email to check

    Returns:
        bool: If the email is valid
    """

    return re.match(r"[^@]+@[^@]+\.[^@]+", email)


# Check passwords on the back-end and on the front-end just in case
policy = PasswordPolicy.from_names(
    length=8,
    uppercase=1,
    numbers=2,
    special=1,
    nonletters=2,
)


@user_endpoints.route("/api/user/", methods=["GET"])
@jwt_required()
def get_user_info():
    """Get the user's information

    Returns:
        json: User's information
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Send the user's username
    return (
        jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "two_factor_enabled": user.two_factor_enabled,
        }),
        200,
    )


@user_endpoints.route("/api/user/register/", methods=["POST"])
def register():
    """Register a new user, and send a verification email.

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or "username" not in data or "email" not in data or "password" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Check if the username and password are in the request
    username = data["username"]
    email = data["email"]
    password = data["password"]

    # Check if the username is already taken
    if Users.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 409

    # Check if the email is already taken
    if Users.query.filter_by(email=email).first():
        return jsonify({"message": "Email already taken"}), 409

    # Check if the username is already taken in the unverified users table
    if UnverifiedUsers.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 409

    # Check if the email is already taken in the unverified users table
    if UnverifiedUsers.query.filter_by(email=email).first():
        return jsonify({"message": "Email already taken"}), 409

    # Check if the username is already taken in the banned users table
    if BannedUsers.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 409

    # Check if the email is already taken in the banned users table
    if BannedUsers.query.filter_by(email=email).first():
        return jsonify({"message": "Email already taken"}), 409

    # Check if the username matches the username policy
    if not is_valid_username(username):
        return jsonify({"message": "Invalid username"}), 400

    # Check if the password matches the password policy
    if policy.test(password):
        return (
            jsonify({
                "message": "Password must be at least 8 characters long, contain at least 1 uppercase letter, 2 numbers, 1 special character, and 2 non-letter characters"
            }),
            400,
        )

    # If everything is valid, create a new user
    new_user = UnverifiedUsers(
        username=username,
        email=email,
        password=Bcrypt.generate_password_hash(password).decode("utf-8"),
    )

    # Get the current time and set in DateTime format for database
    created = datetime.now(timezone.utc)
    new_user.created = created

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    # Generate a 6 character unique code
    unique_code = new_user.unique_code

    # Send the verification email
    msg = Message(
        "Buffet - Verify your account",
        sender=(os.environ.get("MAIL_USERNAME")),
        recipients=[email],
    )
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
            <p>Hello! You're receiving this email because you created an account on Buffet.</p>
            <p>Your unique 6 character code is: {unique_code}</p>
            <p>Please enter this code on the website to verify your account.</p>
            <br>
            <p>Buffet is a free and open source student project developed by <a href="https://kgdn.xyz/">Kieran Gordon</a> as a part of a final year project at <a href="https://www.hw.ac.uk/">Heriot-Watt University</a>.</p>
            <p>The source code for Buffet can be found on <a href="https://github.com/kgdn/buffet">GitHub</a>. If you would like to contribute, please feel free to make a pull request or open an issue.</p>
            <p>If you have any questions, please contact me at <a href="mailto:kjg2000@hw.ac.uk">kjg2000@hw.ac.uk</a>.</p>
            <br>
            <p>Thank you!</p>
            <p><i>Kieran Gordon</i></p>
        </body>
    </html>
    """
    mail.send(msg)

    return (
        jsonify({"message": "User created. Check your email to verify your account. Please check your spam folder if you do not see the email."}),
        201,
    )


@user_endpoints.route("/api/user/verify/", methods=["POST"])
def verify_user():
    """Verify a user's account

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or "username" not in data or "unique_code" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Check if the username and unique code are in the request
    username = data["username"]
    unique_code = data["unique_code"]

    # Check if the user exists in the unverified users table
    user = UnverifiedUsers.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "Invalid username or unique code"}), 401

    # Check if the unique code is correct
    if user.unique_code != unique_code:
        return jsonify({"message": "Invalid code"}), 401

    # If everything is valid, create a new user
    new_user = Users(username=user.username, email=user.email, password=user.password, role="user")

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    # Delete the unverified user
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User verified"}), 200


@user_endpoints.route("/api/user/verify/resend/", methods=["POST"])
def resend_verification_email():
    """Resend the verification email to the user

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or "username" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Check if the username is in the request
    username = data["username"]

    # Check if the user exists in the unverified users table
    user = UnverifiedUsers.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "Invalid username"}), 401

    # Generate a 6 character unique code
    unique_code = user.unique_code

    # Send the verification email
    msg = Message(
        "Buffet - Verify your account",
        sender=(os.environ.get("MAIL_USERNAME")),
        recipients=[user.email],
    )
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
            <p>Hello! You're receiving this email because you created an account on Buffet.</p>
            <p>Your unique 6 character code is: {unique_code}</p>
            <p>Please enter this code on the website to verify your account.</p>
            <br>
            <p>Buffet is a free and open source student project developed by <a href="https://kgdn.xyz/">Kieran Gordon</a> as a part of a final year project at <a href="https://www.hw.ac.uk/">Heriot-Watt University</a>.</p>
            <p>The source code for Buffet can be found on <a href="https://github.com/kgdn/buffet">GitHub</a>. If you would like to contribute, please feel free to make a pull request or open an issue.</p>
            <p>If you have any questions, please contact me at <a href="mailto:kjg2000@hw.ac.uk">kjg2000@hw.ac.uk</a>.</p>
            <br>
            <p>Thank you!</p>
            <p><i>Kieran Gordon</i></p>
        </body>
    </html>
    """
    mail.send(msg)

    return (
        jsonify({
            "message": "Verification email sent. Please check your email to verify your account. Please check your spam folder if you do not see the email."
        }),
        201,
    )


@user_endpoints.route("/api/user/login/", methods=["POST"])
def login():
    """Login a user

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Check if the username or email and password are in the request
    username = data["username"]
    password = data["password"]

    # Check if the user exists and if the password is correct
    # If the user is found in the banned users table, return an error
    # If the user is found in the unverified users table, return an error
    user = Users.query.filter((Users.username == username) | (Users.email == username)).first()
    if not user:
        if BannedUsers.query.filter((BannedUsers.username == username) | (BannedUsers.email == username)).first():
            return (
                jsonify({
                    "message": "You were banned for: "
                    + BannedUsers.query.filter((BannedUsers.username == username) | (BannedUsers.email == username)).first().ban_reason
                    + ". Please contact the head admin to appeal."
                }),
                403,
            )
        if UnverifiedUsers.query.filter((UnverifiedUsers.username == username) | (UnverifiedUsers.email == username)).first():
            return (
                jsonify({"message": "Please verify your account before logging in"}),
                401,
            )
        return jsonify({"message": "Invalid username or password"}), 401

    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid username or password"}), 401

    # Check if LDAP is enabled
    if ApplicationConfig.LDAP_ENABLED:
        # Get the LDAP login form
        login_form = LDAPLoginForm()

        # Get the LDAP username and password from the request
        ldap_username = data["username"]
        ldap_password = data["password"]

        # Check if the LDAP username and password are in the request
        if not ldap_username or not ldap_password:
            return jsonify({"message": "Invalid data format"}), 400

        # Check if the LDAP username and password are correct
        if not login_form.validate():
            return jsonify({"message": "Invalid username or password"}), 401

        # Create a new user
        new_user = Users(username=user.username, email=user.email, password=user.password, role="user")

        # Add the new user to the database
        db.session.add(new_user)
        db.session.commit()

        # Delete the unverified user
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User verified"}), 200

    # Check if the user has 2FA enabled
    if user.two_factor_enabled:
        # Get the 2FA code from the request
        code = data.get("code")
        if not code:
            return jsonify({"message": "Please provide the 2FA code"}), 400

        # Verify the 2FA code
        if not pyotp.TOTP(user.two_factor_secret).verify(code):
            return jsonify({"message": "Invalid 2FA code"}), 401

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
    resp = jsonify({"message": "Login successful"})
    set_access_cookies(resp, access_token)

    return resp, 200


@user_endpoints.route("/api/user/logout/", methods=["POST"])
@jwt_required()
def logout():
    """Logout a user

    Returns:
        json: Message
    """

    # Stop VM if the user has one, if not just logout
    vm = VirtualMachines.query.filter_by(user_id=get_jwt_identity()).first()
    if vm:
        try:
            subprocess.Popen(
                ["kill", str(vm.process_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError:
            return jsonify({"message": "Error deleting virtual machine"}), 500

        db.session.delete(vm)
        db.session.commit()

    # Unset the JWT cookies
    resp = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(resp)

    return resp, 200


@user_endpoints.route("/api/user/delete/", methods=["DELETE"])
@jwt_required()
def delete_user():
    """Delete the user account and their virtual machine if they have one

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the password from the request
    data = request.get_json()
    if not data or "password" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # If the user is an admin, they cannot delete their account
    if user.role == "admin":
        return (
            jsonify({"message": "Admins cannot delete their account, please contact the head admin"}),
            403,
        )

    if BannedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({
                "message": "You were banned for: "
                + BannedUsers.query.filter_by(username=user.username).first().ban_reason
                + ". Please contact the head admin to appeal."
            }),
            403,
        )

    if UnverifiedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({"message": "Please verify your account before deleting it"}),
            401,
        )

    # If user has 2FA enabled, check if the 2FA code is in the request
    if user.two_factor_enabled:
        code = data.get("code")
        if not code:
            return jsonify({"message": "Please provide the 2FA code"}), 400

        # Verify the 2FA code
        if not pyotp.TOTP(user.two_factor_secret).verify(code):
            return jsonify({"message": "Invalid 2FA code"}), 401

    password = data["password"]

    # Check if the password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid password"}), 401

    # Stop the user's virtual machine
    vm = VirtualMachines.query.filter_by(user_id=user.id).first()
    if vm:
        try:
            subprocess.Popen(
                ["kill", str(vm.process_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError:
            return jsonify({"message": "Error deleting virtual machine"}), 500

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200


@user_endpoints.route("/api/user/password/", methods=["PUT"])
@jwt_required()
def change_password():
    """Change the password of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the new password from the request, and the current password
    data = request.get_json()
    if not data or "new_password" not in data or "current_password" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Check if the user is banned
    if BannedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({
                "message": "You were banned for: "
                + BannedUsers.query.filter_by(username=user.username).first().ban_reason
                + ". Please contact the head admin to appeal."
            }),
            403,
        )

    # Check if the user is unverified
    if UnverifiedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({"message": "Please verify your account before changing your password"}),
            401,
        )

    current_password = data["current_password"]
    new_password = data["new_password"]

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"message": "Invalid password"}), 401

    # Check if the new password matches the password policy
    if policy.test(new_password):
        return (
            jsonify({
                "message": "Password must be at least 8 characters long, contain at least 1 uppercase letter, 2 numbers, 1 special character, and 2 non-letter characters"
            }),
            400,
        )

    # If user has 2FA enabled, check if the 2FA code is in the request
    if user.two_factor_enabled:
        code = data.get("code")
        if not code:
            return jsonify({"message": "Please provide the 2FA code"}), 400

        # Verify the 2FA code
        if not pyotp.TOTP(user.two_factor_secret).verify(code):
            return jsonify({"message": "Invalid 2FA code"}), 401

    # Change the password
    user.password = Bcrypt.generate_password_hash(new_password).decode("utf-8")

    # Save the user
    db.session.commit()

    return jsonify({"message": "Password changed"}), 200


@user_endpoints.route("/api/user/username/", methods=["PUT"])
@jwt_required()
def change_username():
    """Change the username of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the new username from the request, and the current password
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Check if the user is banned
    if BannedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({
                "message": "You were banned for: "
                + BannedUsers.query.filter_by(username=user.username).first().ban_reason
                + ". Please contact the head admin to appeal."
            }),
            403,
        )

    # Check if the user is unverified
    if UnverifiedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({"message": "Please verify your account before changing your username"}),
            401,
        )

    # Check if the username is already taken in the banned users table
    if BannedUsers.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already taken"}), 409

    # Check if the username is already taken in the unverified users table
    if UnverifiedUsers.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already taken"}), 409

    # Check if the username is already taken
    if Users.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already taken"}), 409

    # Ensure the username is valid
    if not is_valid_username(data["username"]):
        return jsonify({"message": "Invalid username"}), 400

    username = data["username"]
    password = data["password"]

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid password"}), 401

    # If user has 2FA enabled, check if the 2FA code is in the request
    if user.two_factor_enabled:
        code = data.get("code")
        if not code:
            return jsonify({"message": "Please provide the 2FA code"}), 400

        # Verify the 2FA code
        if not pyotp.TOTP(user.two_factor_secret).verify(code):
            return jsonify({"message": "Invalid 2FA code"}), 401

    # Change the username
    user.username = username

    # Save the user
    db.session.commit()

    return jsonify({"message": "Username changed"}), 200


@user_endpoints.route("/api/user/email/", methods=["PUT"])
@jwt_required()
def change_email():
    """Change the email of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the new email from the request, and the current password
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    email = data["email"]
    password = data["password"]

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid password"}), 401

    # Check if the email is already taken
    if Users.query.filter_by(email=email).first():
        return jsonify({"message": "Email already taken"}), 409

    # Check if the email is already taken in the unverified users table
    if UnverifiedUsers.query.filter_by(email=email).first():
        return jsonify({"message": "Email already taken"}), 409

    # Check if the email is already taken in the banned users table
    if BannedUsers.query.filter_by(email=email).first():
        return jsonify({"message": "Email already taken"}), 409

    # Check if the user is banned
    if BannedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({
                "message": "You were banned for: "
                + BannedUsers.query.filter_by(username=user.username).first().ban_reason
                + ". Please contact the head admin to appeal."
            }),
            403,
        )

    # Check if the user is unverified
    if UnverifiedUsers.query.filter_by(username=user.username).first():
        return (
            jsonify({"message": "Please verify your account before changing your email"}),
            401,
        )

    # Check if the email is valid
    if not is_valid_email(email):
        return jsonify({"message": "Invalid email"}), 400

    # If user has 2FA enabled, check if the 2FA code is in the request
    if user.two_factor_enabled:
        code = data.get("code")
        if not code:
            return jsonify({"message": "Please provide the 2FA code"}), 400

        # Verify the 2FA code
        if not pyotp.TOTP(user.two_factor_secret).verify(code):
            return jsonify({"message": "Invalid 2FA code"}), 401

    # Change the email
    user.email = email

    # Save the user
    db.session.commit()

    return jsonify({"message": "Email changed"}), 200


# Two-factor authentication endpoints
@user_endpoints.route("/api/user/2fa/", methods=["POST"])
@jwt_required()
def setup_2fa():
    """Setup two-factor authentication for the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Generate a secret key
    secret = pyotp.random_base32()

    # Save the secret key to the database, and require the user to verify it
    user.two_factor_secret = secret
    user.two_factor_enabled = False

    # Save the user
    db.session.commit()

    # Generate a QR code for the user to scan
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="Buffet")
    img = qrcode.make(uri)
    img.save("qrcode-" + user.username + ".png")

    # Return the QR code to the user to scan in base64 format
    with open("qrcode-" + user.username + ".png", "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode("utf-8")
    os.remove("qrcode-" + user.username + ".png")

    return jsonify({"message": "2FA setup", "qr_code": img_base64}), 200


@user_endpoints.route("/api/user/2fa/verify/", methods=["POST"])
@jwt_required()
def verify_2fa():
    """Verify the user's two-factor authentication

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the code from the request
    data = request.get_json()
    if not data or "code" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    code = data["code"]

    # Verify the code
    if pyotp.TOTP(user.two_factor_secret).verify(code):
        user.two_factor_enabled = True
        db.session.commit()

        return jsonify({"message": "2FA verified"}), 200

    return jsonify({"message": "Invalid 2FA code"}), 401


@user_endpoints.route("/api/user/2fa/disable/", methods=["POST"])
@jwt_required()
def disable_2fa():
    """Disable the user's two-factor authentication

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the password and 2FA code from the request
    data = request.get_json()
    if not data or "password" not in data or "code" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Verify the 2FA code
    code = data["code"]
    if not pyotp.TOTP(user.two_factor_secret).verify(code):
        return jsonify({"message": "Invalid 2FA code"}), 401

    password = data["password"]

    # Check if the password is correct
    if not Bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid password"}), 401

    # Disable 2FA and clear the secret key
    user.two_factor_enabled = False
    user.two_factor_secret = None
    db.session.commit()

    return jsonify({"message": "2FA disabled"}), 200
