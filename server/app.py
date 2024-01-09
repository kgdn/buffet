import subprocess
import json
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from flask_jwt_extended import get_jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import ApplicationConfig
from models import db, VirtualMachine, User

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app, supports_credentials=True)
jwt = JWTManager(app)
Bcrypt = Bcrypt(app)
db.init_app(app)
migrate = Migrate(app, db)

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

############################# USER ENDPOINTS #############################

@app.route('/api/user/', methods=['GET'])
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

@app.route('/api/user/verify/', methods=['GET'])
@jwt_required()
def verify():
    """Verify the user's token

    Returns:
        json: Message
    """

    return jsonify({'message': 'Token verified'}), 200

@app.route('/api/user/register/', methods=['POST'])
def register():
    """Register a new user

    Returns:
        json: Message
    """

    # Get the data from the request
    data = request.get_json()
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the data from the request
    username = data['username']
    email = data['email']
    password = data['password']
     
    # Check if the username is already taken
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 409

    # Check if the email is already taken
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already taken'}), 409

    # Create the user
    new_user = User(username=username, email=email, password=Bcrypt.generate_password_hash(password).decode('utf-8'), role='user')
    db.session.add(new_user)

    # Save the user
    db.session.commit()

    return jsonify({'message': 'User created'}), 201

@app.route('/api/user/login/', methods=['POST'])
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
    user = User.query.filter_by(username=username).first()
    if not user or not Bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

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
    return resp, 200

@app.route('/api/user/logout/', methods=['POST'])
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
    return resp, 200
    
@app.route('/api/user/delete/', methods=['DELETE'])
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

    return jsonify({'message': 'User deleted'}), 200

@app.route('/api/user/password/', methods=['PUT'])
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

    return jsonify({'message': 'Password changed'}), 200

@app.route('/api/user/username/', methods=['PUT'])
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

    return jsonify({'message': 'Username changed'}), 200

@app.route('/api/user/email/', methods=['PUT'])
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

    return jsonify({'message': 'Email changed'}), 200

################################## VIRTUAL MACHINE ENDPOINTS ##################################

@app.route('/api/vm/iso/', methods=['GET'])
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

    # Index the iso/index.json file
    with open('iso/index.json', 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)
        return jsonify(data), 200


@app.route('/api/vm/create/', methods=['POST'])
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
        return jsonify({'message': 'No available ports'}), 503

    wsport = port - 200

    # If the user has more than one virtual machine at a time, throw an error
    if VirtualMachine.query.filter_by(user_id=user.id).count() > 0:
        return jsonify({'message': 'Only one virtual machine at a time'}), 503

    # Create the virtual machine
    try:
        process = subprocess.Popen([
            # qemu-system-x86_64 -m 2G -smp 8,sockets=2,cores=2,threads=2,maxcpus=8 -cdrom iso/archlinux.iso accel=kvm -enable-kvm -vga virtio -vnc :0,websocket=5900,to=5
            'qemu-system-x86_64', '-m', '2048M', '-smp', '2', '-enable-kvm', '-device', 'virtio-balloon', '-cdrom', 'iso/' + iso, '-vga', 'virtio', '-net', 'nic', '-net', 'user', '-vnc', ':0,websocket=' + str(wsport) + ',to=5'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
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

@app.route('/api/vm/delete/', methods=['DELETE'])
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

@app.route('/api/vm/user/', methods=['GET'])
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
        'port': vm.port,
        'wsport': vm.wsport,
        'iso': vm.iso,
        'process_id': vm.process_id,
        'user_id': vm.user_id
    }), 200

@app.route('/api/vm/', methods=['GET'])
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

@app.route('/api/vm/count/', methods=['GET'])
@jwt_required()
def get_vm_count():
    """Get the number of virtual machines

    Returns:
        json: Number of virtual machines
    """

    # Get the number of virtual machines
    vm_count = VirtualMachine.query.count()

    return jsonify({'vm_count': vm_count}), 200

################################## ADMIN ENDPOINTS ##################################

@app.route('/api/admin/vm/all/', methods=['GET'])
@jwt_required()
def get_all_vm():
    """Get all virtual machines

    Returns:
        json: List of virtual machines
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get all virtual machines
    vms = VirtualMachine.query.all()
    if not vms:
        return jsonify({'message': 'No virtual machines'}), 404

    vms_list = []
    for vm in vms:
        vms_list.append({
            'id': vm.id,
            'port': vm.port,
            'wsport': vm.wsport,
            'iso': vm.iso,
            'process_id': vm.process_id,
            'user_id': vm.user_id
        })

    return jsonify(vms_list), 200

@app.route('/api/admin/vm/delete/', methods=['DELETE'])
@jwt_required()
def delete_vm_by_id():
    """Stop virtual machine by id

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the virtual machine id from the request
    data = request.get_json()
    if not data or 'vm_id' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the virtual machine, if it exists
    vm = VirtualMachine.query.filter_by(id=data['vm_id']).first()
    if not vm:
        return jsonify({'message': 'Invalid virtual machine'}), 404

    # Stop the virtual machine
    try:
        subprocess.Popen(['kill', str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except:
        return jsonify({'message': 'Error deleting virtual machine'}), 500

    # Stop the virtual machine from the database
    db.session.delete(vm)
    db.session.commit()

    return jsonify({'message': 'Virtual machine deleted'}), 200

# Get all users
@app.route('/api/admin/user/all/', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users

    Returns:
        json: List of users
    """
    
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get all users
    users = User.query.all()
    if not users:
        return jsonify({'message': 'No users'}), 404

    users_list = []
    for user in users:
        users_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'login_time': user.login_time,
            'ip': user.ip
        })

    return jsonify(users_list), 200

@app.route('/api/admin/user/delete/', methods=['DELETE'])
@jwt_required()
def delete_user_by_id():
    """Delete user by id

    Returns:
        json: Message
    """
    
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or 'user_id' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the user, if it exists
    user_to_delete = User.query.filter_by(id=data['user_id']).first()
    if not user_to_delete:
        return jsonify({'message': 'Invalid user'}), 404

    # If the user is an admin, they cannot delete their account
    if user_to_delete.role == 'admin':
        return jsonify({'message': 'Admins cannot delete their account, please contact the head admin'}), 403

    # Stop the user's virtual machine
    vm = VirtualMachine.query.filter_by(user_id=user_to_delete.id).first()
    if vm:
        try:
            subprocess.Popen(['kill', str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except:
            return jsonify({'message': 'Error deleting virtual machine'}), 500

    db.session.delete(user_to_delete)
    db.session.commit()

    return jsonify({'message': 'User deleted'}), 200

@app.route('/api/admin/user/role/', methods=['PUT'])
@jwt_required()
def change_user_role():
    """Change the role of the user

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401

    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or 'user_id' not in data or 'role' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    user_to_change = User.query.filter_by(id=data['user_id']).first()
    if not user_to_change:
        return jsonify({'message': 'Invalid user'}), 404

    # If the user is an admin, they cannot change their role
    if user_to_change.role == 'admin':
        return jsonify({'message': 'Admins cannot change their role, please contact the head admin'}), 403

    user_to_change.role = data['role']

    db.session.commit()

    return jsonify({'message': 'User role changed'}), 200

@app.route('/api/admin/user/password/', methods=['PUT'])
@jwt_required()
def change_user_password():
    """Change the password of the user

    Returns:
        json: Message
    """
    
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or 'user_id' not in data or 'new_password' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the user, if it exists
    user_to_change = User.query.filter_by(id=data['user_id']).first()
    if not user_to_change:
        return jsonify({'message': 'Invalid user'}), 404

    user_to_change.password = Bcrypt.generate_password_hash(data['new_password']).decode('utf-8')

    db.session.commit()

    return jsonify({'message': 'User password changed'}), 200

@app.route('/api/admin/user/username/', methods=['PUT'])
@jwt_required()
def change_user_username():
    """Change the username of the user

    Returns:
        json: Message
    """
    
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or 'user_id' not in data or 'username' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the user, if it exists
    user_to_change = User.query.filter_by(id=data['user_id']).first()
    if not user_to_change:
        return jsonify({'message': 'Invalid user'}), 404

    # Check if the username is already taken
    user_to_change.username = data['username']

    db.session.commit()

    return jsonify({'message': 'User username changed'}), 200

@app.route('/api/admin/user/email/', methods=['PUT'])
@jwt_required()
def change_user_email():
    """Change the email of the user

    Returns:
        json: Message
    """
    
    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if user.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or 'user_id' not in data or 'email' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the user, if it exists
    user_to_change = User.query.filter_by(id=data['user_id']).first()
    if not user_to_change:
        return jsonify({'message': 'Invalid user'}), 404

    user_to_change.email = data['email']

    db.session.commit()

    return jsonify({'message': 'User email changed'}), 200

# Get all virtual machines for a user
@app.route('/api/admin/user/vm/', methods=['GET'])
@jwt_required()
def get_user_vms():
    """Get all virtual machines for a user

    Returns:
        json: List of virtual machines
    """
    
    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if admin.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get the user id from the request
    data = request.get_json()
    if not data or 'user_id' not in data:
        return jsonify({'message': 'Invalid data format'}), 400

    # Get the user, if it exists
    user = User.query.filter_by(id=data['user_id']).first()
    if not user:
        return jsonify({'message': 'Invalid user'}), 404

    # Get all virtual machines for the user
    vms = VirtualMachine.query.filter_by(user_id=user.id).all()
    if not vms:
        return jsonify({'message': 'No virtual machines'}), 404

    vms_list = []
    for vm in vms:
        vms_list.append({
            'id': vm.id,
            'port': vm.port,
            'wsport': vm.wsport,
            'iso': vm.iso,
            'process_id': vm.process_id,
            'user_id': vm.user_id
        })

    return jsonify(vms_list), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)