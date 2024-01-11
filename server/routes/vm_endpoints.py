import json
import base64
import subprocess
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, VirtualMachine

vm_endpoints = Blueprint('vm', __name__)

@vm_endpoints.route('/api/vm/iso/', methods=['GET'])
@jwt_required()
def index_vm():
    """Index the iso/index.json file

    Returns:
        json: Index of the iso/index.json file
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Index the ../iso/index.json file (iso is in the parent directory)
    with open('iso/index.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    return jsonify(data), 200

@vm_endpoints.route('/api/vm/create/', methods=['POST'])
@jwt_required()
def create_vm():
    """Create a virtual machine

    Returns:
        json: Virtual machine
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    data = request.get_json()
    if not data or 'iso' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    iso = data['iso']

    # Get the next available port, choose a random port between 5900 and 6000
    port = 5900
    while port <= 5905:
        if not VirtualMachine.query.filter_by(port=port).first():
            break
        port += 1

    if port > 5905:
        return jsonify({'message': 'Service is at capacity. Please try again later.'}), 503

    wsport = port - 200

    # If the user has more than one virtual machine at a time, throw an error
    if VirtualMachine.query.filter_by(user_id=user.id).count() > 0:
        return jsonify({'message': 'Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one.'}), 403

    # Create the virtual machine
    try:
        process = subprocess.Popen([
            'qemu-system-x86_64', '-m', '2048M', '-smp', '2', '-enable-kvm', '-device', 'virtio-balloon', '-cdrom', 'iso/' + iso, '-vga', 'virtio', '-net', 'nic', '-net', 'user', '-vnc', ':0,websocket=' + str(wsport) + ',to=5'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process_id = process.pid
    except:
        return jsonify({'message': 'QEMU failed to create virtual machine. This is likely due to a lack of resources on the server.'}), 500

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

@vm_endpoints.route('/api/vm/delete/', methods=['DELETE'])
@jwt_required()
def delete_vm():
    """Stop a virtual machine

    Returns:
        json: Message
    """

    # Get the user from the authorization token
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

    # Stop the virtual machine
    try:
        subprocess.Popen(['kill', str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except:
        return jsonify({'message': 'Error deleting virtual machine'}), 500

    # Stop the virtual machine from the database
    db.session.delete(vm)
    db.session.commit()

    return jsonify({'message': 'Virtual machine deleted'}), 200

@vm_endpoints.route('/api/vm/user/', methods=['GET'])
@jwt_required()
def get_user_vm():
    """Get the virtual machine of the user

    Returns:
        json: Virtual machine
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Get the user's virtual machine
    vm = VirtualMachine.query.filter_by(user_id=user.id).first()
    if not vm:
        return jsonify({'message': 'Invalid virtual machine'}), 404

    return jsonify({
        'id': vm.id,
        'iso': vm.iso,
        'wsport': vm.wsport,
        'process_id': vm.process_id,
        'user_id': vm.user_id
    }), 200

@vm_endpoints.route('/api/vm/', methods=['GET'])
@jwt_required()
def get_vm_by_id():
    """Get the virtual machine by id

    Returns:
        json: Virtual machine
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401


    # Get the virtual machine id from the request
    data = request.get_json()
    if not data or 'vm_id' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the virtual machine, if it exists
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

@vm_endpoints.route('/api/vm/count/', methods=['GET'])
@jwt_required()
def get_vm_count():
    """Get the number of virtual machines

    Returns:
        json: Number of virtual machines
    """

    # Get the number of virtual machines
    vm_count = VirtualMachine.query.count()

    return jsonify({'vm_count': vm_count}), 200
