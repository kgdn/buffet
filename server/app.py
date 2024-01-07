import socket
import subprocess
import json
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from flask_jwt_extended import get_jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from config import ApplicationConfig
from models import db, VirtualMachine, User

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app)
jwt = JWTManager(app)
Bcrypt = Bcrypt(app)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.after_request
def refresh_expiring_jwts(response):
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

@app.route('/api/user/', methods=['GET'])
@jwt_required()
def get_username():
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Send the user's username
    return jsonify({
        'id': user.id,
        'username': user.username
    }), 200

@app.route('/api/user/register/', methods=['POST'])
def register():
    # Get the username and password from the request, check if the username is already taken
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    username = data['username']
    password = data['password']
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 409

    # Create the user
    new_user = User(username=username, password=Bcrypt.generate_password_hash(password).decode('utf-8'))
    db.session.add(new_user)

    # Save the user
    db.session.commit()

    return jsonify({
        'id': new_user.id,
        'username': new_user.username
    }), 201

@app.route('/api/user/login/', methods=['POST'])
def login():
    # Get the username and password from the request, and send an authorization token if the credentials are correct
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    username = data['username']
    password = data['password']

    # Check if the user exists and if the password is correct
    user = User.query.filter_by(username=username).first()
    if not user or not Bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    # Set access and refresh JWT cookies
    access_token = create_access_token(identity=user.id)
    resp = jsonify({'login': True})
    set_access_cookies(resp, access_token)
    return resp, 200

@app.route('/api/user/logout/', methods=['POST'])
def logout():
    # Unset JWT cookies
    resp = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(resp)
    return resp, 200
    
@app.route('/api/user/delete/', methods=['DELETE'])
@jwt_required()
def delete_user():
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Delete the user
    db.session.delete(user)

    # Save the user
    db.session.commit()

    return jsonify({'message': 'User deleted'}), 200

# Change the password of the user
# The user must send their current password and the new password, as well as the authorization token
@app.route('/api/user/password/', methods=['PUT'])
@jwt_required()
def change_password():
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the current and new password from the request
    data = request.get_json()
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    current_password = data['current_password']
    new_password = data['new_password']

    # Check if the current password is correct
    if not Bcrypt.check_password_hash(user.password, current_password):
        return jsonify({'message': 'Invalid password'}), 401

    # Change the password
    user.password = Bcrypt.generate_password_hash(new_password).decode('utf-8')

    # Save the user
    db.session.commit()

    return jsonify({'message': 'Password changed'}), 200

# Change the username of the user
@app.route('/api/user/username/', methods=['PUT'])
@jwt_required()
def change_username():
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the new username from the request
    data = request.get_json()
    if not data or 'username' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Change the username
    user.username = data['username']

    # Save the user
    db.session.commit()

    return jsonify({'message': 'Username changed'}), 200

####################################################################################################################################

@app.route('/api/vm/iso/', methods=['GET'])
@jwt_required()
def index_vm():
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Index the iso/index.json file
    with open('iso/index.json') as json_file:
        data = json.load(json_file)
        return jsonify(data), 200

# POST /api/vm/create/
# params: iso
# Create a virtual machine
@app.route('/api/vm/create/', methods=['POST'])
@jwt_required()
def create_vm():
    # Get the user from the authorization token, and ensure the user has a session
    # Get the next available port, the VNC client is connecting on port 5700 + display number
    # Highest port is 5705
    # Create the virtual machine
    # qemu-system-x86_64 -m 4G -cpu max -smp 4 -cdrom ubuntu.iso -enable-kvm -monitor stdio -vga virtio -vnc :0,websocket=on,to=5
    # Create the virtual machine in the database

    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    data = request.get_json()
    if not data or 'iso' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    iso = data['iso']

    # Get the next available port
    port = 5900
    while port <= 5905:
        if not VirtualMachine.query.filter_by(port=port).first():
            break
        port += 1

    if port > 5905:
        return jsonify({'message': 'No available ports'}), 503

    wsport = port - 200

    # If the user has more than one virtual machine at a time, throw an error
    if VirtualMachine.query.filter_by(user_id=user.id).count() > 0:
        return jsonify({'message': 'Only one virtual machine at a time'}), 503

    # Create the virtual machine
    try:
        process = subprocess.Popen([
            'qemu-system-x86_64', '-m', '4G', '-cpu', 'max', '-smp', '4', '-cdrom', 'iso/' + iso, '-enable-kvm', '-monitor', 'stdio', '-vga', 'virtio', '-vnc', ':0,websocket=' + str(wsport) + ',to=5'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process_id = process.pid
    except:
        return jsonify({'message': 'Error creating virtual machine'}), 500

    # Create the virtual machine in the database
    new_vm = VirtualMachine(port=port, wsport=wsport, iso=iso, process_id=process_id, user_id=user.id)
    db.session.add(new_vm)
    db.session.commit()

    return jsonify({
        'id': new_vm.id,
        'port': new_vm.port,
        'wsport': new_vm.wsport,
        'iso': new_vm.iso,
        'process_id': new_vm.process_id,
        'user_id': new_vm.user_id
    }), 201

# DELETE /api/vm/delete/
# params: vm_id
# Delete a virtual machine
# The user should only be able to delete their own virtual machine, not someone else's
@app.route('/api/vm/delete/', methods=['DELETE'])
@jwt_required()
def delete_vm():
    # Get the user from the authorization token, and ensure the user has a session
    # Get the virtual machine from the database
    # Delete the virtual machine
    # Delete the virtual machine from the database

    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    data = request.get_json()
    if not data or 'vm_id' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    vm = VirtualMachine.query.filter_by(id=data['vm_id']).first()
    if not vm:
        return jsonify({'message': 'Invalid virtual machine'}), 404

    # Ensure the user is deleting their own virtual machine
    if vm.user_id != user.id:
        return jsonify({'message': 'You can only delete your own virtual machine'}), 403

    # Delete the virtual machine
    try:
        process = subprocess.Popen(['kill', str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process_id = process.pid
    except:
        return jsonify({'message': 'Error deleting virtual machine'}), 500

    # Delete the virtual machine from the database
    db.session.delete(vm)
    db.session.commit()

    return jsonify({'message': 'Virtual machine deleted'}), 200

# GET /api/vm/user/
# params: user_id
# Get the virtual machine of the user
@app.route('/api/vm/user/', methods=['GET'])
@jwt_required()
def get_user_vm():
    # Get the user from the authorization token, and ensure the user has a session
    # Get the virtual machine from the database
    # Send the virtual machine

    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    vm = VirtualMachine.query.filter_by(user_id=user.id).first()
    if not vm:
        return jsonify({'message': 'Invalid virtual machine'}), 404

    return jsonify({
        'id': vm.id,
        'port': vm.port,
        'wsport': vm.wsport,
        'iso': vm.iso,
        'process_id': vm.process_id,
        'user_id': vm.user_id
    }), 200

# GET /api/vm/
# params: vm_id
# Get the virtual machine
@app.route('/api/vm/', methods=['GET'])
@jwt_required()
def get_vm_by_id():
    # Get the user from the authorization token, and ensure the user has a session
    # Get the virtual machine from the database
    # Send the virtual machine

    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    data = request.get_json()
    if not data or 'vm_id' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    vm = VirtualMachine.query.filter_by(id=data['vm_id']).first()
    if not vm:
        return jsonify({'message': 'Invalid virtual machine'}), 404

    return jsonify({
        'id': vm.id,
        'port': vm.port,
        'wsport': vm.wsport,
        'iso': vm.iso,
        'process_id': vm.process_id,
        'user_id': vm.user_id
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)