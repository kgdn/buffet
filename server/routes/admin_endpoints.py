# admin_endpoints.py - Contains the admin endpoints for the server.
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

import json
import os
import re
import subprocess
from datetime import datetime

import cef
from flask import Blueprint, jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import get_jwt_identity, jwt_required
from helper_functions import HelperFunctions
from models import BannedUser, UnverifiedUser, User, VirtualMachine, db
from password_strength import PasswordPolicy

admin_endpoints = Blueprint("admin", __name__)
Bcrypt = Bcrypt()


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


@admin_endpoints.route("/api/admin/vm/all/", methods=["GET"])
@jwt_required()
def get_all_vm():
    """Get all virtual machines

    Returns:
        json: List of virtual machines
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get all virtual machines
    vms = VirtualMachine.query.all()
    if not vms:
        return jsonify({"message": "No virtual machines"}), 404

    name = None
    version = None
    desktop = None

    # Get the name of the operating system, version and desktop environment
    with open("iso/index.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for iso in data:
            if iso["iso"] == vms[0].iso:
                name = iso["name"]
                version = iso["version"]
                desktop = iso["desktop"]
                break

    vms_list = []
    for vm in vms:
        vms_list.append(
            {
                "id": vm.id,
                "port": vm.port,
                "wsport": vm.wsport,
                "iso": vm.iso,
                "process_id": vm.process_id,
                "user_id": vm.user_id,
                "name": name,
                "version": version,
                "desktop": desktop,
            }
        )

    return jsonify(vms_list), 200


@admin_endpoints.route("/api/admin/vm/delete/", methods=["DELETE"])
@jwt_required()
def delete_vm_by_id():
    """Stop virtual machine by id

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the virtual machine id from the request
    data = request.get_json()
    if not data or "vm_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the virtual machine, if it exists
    vm = VirtualMachine.query.filter_by(id=data["vm_id"]).first()
    if not vm:
        return jsonify({"message": "Invalid virtual machine"}), 404

    # Stop the virtual machine
    try:
        subprocess.Popen(
            ["kill", str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
    except:
        return jsonify({"message": "Error deleting virtual machine"}), 500

    # Stop the virtual machine from the database
    db.session.delete(vm)
    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "Virtual machine deleted by admin",
        9,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=user.username,
    )

    return jsonify({"message": "Virtual machine deleted"}), 200


# Get all users
@admin_endpoints.route("/api/admin/user/all/", methods=["GET"])
@jwt_required()
def get_all_users():
    """Get all users

    Returns:
        json: List of users
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get all users
    users = User.query.all()
    if not users:
        return jsonify({"message": "No users"}), 404

    users_list = []
    for user in users:
        users_list.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "login_time": user.login_time,
                "ip": user.ip,
            }
        )

    return jsonify(users_list), 200


@admin_endpoints.route("/api/admin/user/delete/", methods=["DELETE"])
@jwt_required()
def delete_user_by_id():
    """Delete user by id

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    user_to_delete = User.query.filter_by(id=data["user_id"]).first()
    if not user_to_delete:
        return jsonify({"message": "Invalid user"}), 404

    # If the user is an admin, they cannot delete their account
    if user_to_delete.role == "admin":
        return (
            jsonify(
                {
                    "message": "Admins cannot delete their account, please contact the head admin"
                }
            ),
            403,
        )

    # Stop the user's virtual machine
    vm = VirtualMachine.query.filter_by(user_id=user_to_delete.id).first()
    if vm:
        try:
            subprocess.Popen(
                ["kill", str(vm.process_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except:
            return jsonify({"message": "Error deleting virtual machine"}), 500

    db.session.delete(user_to_delete)
    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "User " + user_to_delete.username + " deleted by admin",
        9,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=user.username,
    )

    return jsonify({"message": "User deleted"}), 200


@admin_endpoints.route("/api/admin/user/role/", methods=["PUT"])
@jwt_required()
def change_user_role():
    """Change the role of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data or "role" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    user_to_change = User.query.filter_by(id=data["user_id"]).first()
    if not user_to_change:
        return jsonify({"message": "Invalid user"}), 404

    # If the user is an admin, they cannot change their role
    if user_to_change.role == "admin":
        return (
            jsonify(
                {
                    "message": "Admins cannot change their role, please contact the head admin"
                }
            ),
            403,
        )

    user_to_change.role = data["role"]

    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "User "
        + user_to_change.username
        + " role changed to "
        + data["role"]
        + " by admin",
        10,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=user.username,
    )

    return jsonify({"message": "User role changed"}), 200


@admin_endpoints.route("/api/admin/user/username/", methods=["PUT"])
@jwt_required()
def change_user_username():
    """Change the username of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data or "username" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    user_to_change = User.query.filter_by(id=data["user_id"]).first()
    if not user_to_change:
        return jsonify({"message": "Invalid user"}), 404

    # Check if the username is already taken in the users table
    username_exists = User.query.filter_by(username=data["username"]).first()
    if username_exists:
        return jsonify({"message": "Username already taken"}), 400

    # Check if the username is already taken in the banned users table
    username_exists = BannedUser.query.filter_by(username=data["username"]).first()
    if username_exists:
        return jsonify({"message": "Username already taken"}), 400

    # Check if the username is a valid format
    if not is_valid_username(data["username"]):
        return jsonify({"message": "Invalid username"}), 400

    user_to_change.username = data["username"]

    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "User "
        + user_to_change.username
        + " username changed to "
        + data["username"]
        + " by admin",
        3,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=user.username,
    )

    return jsonify({"message": "User username changed"}), 200


@admin_endpoints.route("/api/admin/user/email/", methods=["PUT"])
@jwt_required()
def change_user_email():
    """Change the email of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data or "email" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    user_to_change = User.query.filter_by(id=data["user_id"]).first()
    if not user_to_change:
        return jsonify({"message": "Invalid user"}), 404

    # Check if the email is already taken
    email_exists = User.query.filter_by(email=data["email"]).first()
    if email_exists:
        return jsonify({"message": "Email already taken"}), 400

    # Check if the email is already taken in the banned users table
    email_exists = BannedUser.query.filter_by(email=data["email"]).first()
    if email_exists:
        return jsonify({"message": "Email already taken"}), 400

    # Check if the email is valid
    if not is_valid_email(data["email"]):
        return jsonify({"message": "Invalid email"}), 400

    user_to_change.email = data["email"]

    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "User "
        + user_to_change.username
        + " email changed to "
        + data["email"]
        + " by admin",
        3,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=user.username,
    )

    return jsonify({"message": "User email changed"}), 200


# Get all virtual machines for a user
@admin_endpoints.route("/api/admin/user/vm/", methods=["GET"])
@jwt_required()
def get_user_vms():
    """Get all virtual machines for a user

    Returns:
        json: List of virtual machines
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    user = User.query.filter_by(id=data["user_id"]).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 404

    # Get all virtual machines for the user
    vms = VirtualMachine.query.filter_by(user_id=user.id).all()
    if not vms:
        return jsonify({"message": "No virtual machines"}), 404

    vms_list = []
    for vm in vms:
        vms_list.append(
            {
                "id": vm.id,
                "port": vm.port,
                "wsport": vm.wsport,
                "iso": vm.iso,
                "process_id": vm.process_id,
                "user_id": vm.user_id,
            }
        )

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "Virtual machines of user " + user.username + " retrieved by admin",
        8,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=admin.username,
    )

    return jsonify(vms_list), 200


@admin_endpoints.route("/api/admin/user/ban/", methods=["PUT"])
@jwt_required()
def ban_user():
    """Ban a user with an optional reason

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    user = User.query.filter_by(id=data["user_id"]).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 404

    # Get the ban reason from the request
    if "ban_reason" not in data:
        data["ban_reason"] = None

    # Kill their virtual machine
    vm = VirtualMachine.query.filter_by(user_id=user.id).first()
    if vm:
        try:
            subprocess.Popen(
                ["kill", str(vm.process_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except:
            return jsonify({"message": "Error deleting virtual machine"}), 500

        db.session.delete(vm)

    # Ban the user by moving them to the banned users table
    banned_user = BannedUser(
        user_id=user.id,
        username=user.username,
        email=user.email,
        password=user.password,
        login_time=user.login_time,
        ip=user.ip,
        role=user.role,
        ban_reason=data["ban_reason"],
        two_factor_enabled=user.two_factor_enabled,
        two_factor_secret=user.two_factor_secret,
    )

    db.session.add(banned_user)
    db.session.delete(user)
    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "User " + user.username + " banned by admin with reason " + data["ban_reason"],
        8,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=admin.username,
    )

    return jsonify({"message": "User banned"}), 200


@admin_endpoints.route("/api/admin/user/unban/", methods=["PUT"])
@jwt_required()
def unban_user():
    """Unban a user by moving them back to the users table

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user, user not found"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    banned_user = BannedUser.query.filter_by(user_id=data["user_id"]).first()
    if not banned_user:
        return jsonify({"message": "Invalid user"}), 404

    # Create the user in the users table
    user = User(
        username=banned_user.username,
        email=banned_user.email,
        password=banned_user.password,
        login_time=banned_user.login_time,
        ip=banned_user.ip,
        role=banned_user.role,
        two_factor_enabled=banned_user.two_factor_enabled,
        two_factor_secret=banned_user.two_factor_secret,
    )

    db.session.add(user)
    db.session.delete(banned_user)
    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "User " + user.username + " unbanned by admin",
        8,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=admin.username,
    )

    return jsonify({"message": "User unbanned"}), 200


@admin_endpoints.route("/api/admin/user/banned/", methods=["GET"])
@jwt_required()
def get_banned_users():
    """Get all banned users

    Returns:
        json: List of banned users
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get all banned users
    banned_users = BannedUser.query.all()
    if not banned_users:
        return jsonify({"message": "No banned users"}), 404

    banned_users_list = []
    for banned_user in banned_users:
        banned_users_list.append(
            {
                "id": banned_user.id,
                "user_id": banned_user.user_id,
                "username": banned_user.username,
                "email": banned_user.email,
                "login_time": banned_user.login_time,
                "ip": banned_user.ip,
                "role": banned_user.role,
                "ban_reason": banned_user.ban_reason,
                "two_factor_enabled": banned_user.two_factor_enabled,
            }
        )

    return jsonify(banned_users_list), 200


@admin_endpoints.route("/api/admin/user/banned/delete/", methods=["DELETE"])
@jwt_required()
def delete_banned_user():
    """Delete a banned user (effectively perma-ban)

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    banned_user = BannedUser.query.filter_by(id=data["user_id"]).first()
    if not banned_user:
        return jsonify({"message": "Invalid user"}), 404

    db.session.delete(banned_user)
    db.session.commit()

    return jsonify({"message": "Banned user deleted"}), 200


# Get all unverified users
@admin_endpoints.route("/api/admin/user/unverified/", methods=["GET"])
@jwt_required()
def get_unverified_users():
    """Get all unverified users

    Returns:
        json: List of unverified users
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get all unverified users from the UnverifiedUser table
    unverified_users = UnverifiedUser.query.all()
    if not unverified_users:
        return jsonify({"message": "No unverified users"}), 404

    unverified_users_list = []
    for unverified_user in unverified_users:
        unverified_users_list.append(
            {
                "id": unverified_user.id,
                "username": unverified_user.username,
                "email": unverified_user.email,
            }
        )

    return jsonify(unverified_users_list), 200


@admin_endpoints.route("/api/admin/user/unverified/delete/", methods=["DELETE"])
@jwt_required()
def delete_unverified_user():
    """Delete an unverified user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    unverified_user = UnverifiedUser.query.filter_by(id=data["user_id"]).first()
    if not unverified_user:
        return jsonify({"message": "Invalid user"}), 404

    db.session.delete(unverified_user)
    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    # Log the event in CEF format
    cef.log_cef(
        "Unverified user " + unverified_user.username + " deleted by admin",
        7,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=admin.username,
    )

    return jsonify({"message": "Unverified user deleted"}), 200


@admin_endpoints.route("/api/admin/user/unverified/verify/", methods=["PUT"])
@jwt_required()
def verify_unverified_user():
    """Verify an unverified user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the user, if it exists
    unverified_user = UnverifiedUser.query.filter_by(id=data["user_id"]).first()
    if not unverified_user:
        return jsonify({"message": "Invalid user"}), 404

    # Create the user in the users table
    user = User(
        username=unverified_user.username,
        email=unverified_user.email,
        password=unverified_user.password,
        login_time=None,
        ip=None,
        role="user",
        two_factor_enabled=False,
        two_factor_secret=None,
    )

    db.session.add(user)
    db.session.delete(unverified_user)
    db.session.commit()

    HelperFunctions.create_cef_logs_folders()

    cef.log_cef(
        "Unverified user " + unverified_user.username + " verified by admin",
        5,
        request.environ,
        config={
            "cef.product": "Buffet",
            "cef.vendor": "kgdn",
            "cef.version": "0",
            "cef.device_version": "0.1",
            "cef.file": "logs/" + str(datetime.now().date()) + "/buffet.log",
        },
        username=admin.username,
    )

    return jsonify({"message": "Unverified user verified"}), 200


@admin_endpoints.route("/api/admin/logs/", methods=["GET"])
@jwt_required()
def get_all_logs():
    """Get all logs

    Returns:
        json: Logs
    """

    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if admin.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get all logs
    logs = {}
    for log_date in os.listdir("logs"):
        if os.path.isdir("logs/" + log_date):
            logs[log_date] = []
            for log_file in os.listdir("logs/" + log_date):
                if os.path.isfile("logs/" + log_date + "/" + log_file):
                    with open("logs/" + log_date + "/" + log_file, "r") as f:
                        logs[log_date].extend(f.readlines())

    return jsonify(logs), 200
