import json
from datetime import timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Users, ApplicationConfigDb
from config import ApplicationConfig

config_endpoints = Blueprint("config_endpoints", __name__)


@config_endpoints.route("/api/config/", methods=["GET"])
@jwt_required()
def get_config():
    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    config = ApplicationConfig.get_config()
    # Convert timedelta to string
    for key, value in config.items():
        if isinstance(value, timedelta):
            config[key] = str(value)
    return jsonify(config)


@config_endpoints.route("/api/config/", methods=["POST"])
@jwt_required()
def update_config():
    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Ensure the user is an admin
    if user.role != "admin":
        return jsonify({"message": "Insufficient permissions"}), 403

    # Get the new config from the request
    new_config = request.json
    if not new_config:
        return jsonify({"message": "No config provided"}), 400

    # Update the config in the database
    for key, value in new_config.items():
        config_entry = ApplicationConfigDb.query.filter_by(key=key).first()
        if config_entry:
            config_entry.value = value
        else:
            config_entry = ApplicationConfigDb(key=key, value=value)
        config_entry.save()
