from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, unset_jwt_cookies
from flask_bcrypt import Bcrypt
from models import db, User, VirtualMachine, BannedUser
import subprocess

admin_endpoints = Blueprint('admin', __name__)
Bcrypt = Bcrypt()

@admin_endpoints.route('/api/admin/vm/all/', methods=['GET'])
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

@admin_endpoints.route('/api/admin/vm/delete/', methods=['DELETE'])
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
@admin_endpoints.route('/api/admin/user/all/', methods=['GET'])
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

@admin_endpoints.route('/api/admin/user/delete/', methods=['DELETE'])
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

@admin_endpoints.route('/api/admin/user/role/', methods=['PUT'])
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

@admin_endpoints.route('/api/admin/user/password/', methods=['PUT'])
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

@admin_endpoints.route('/api/admin/user/username/', methods=['PUT'])
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

@admin_endpoints.route('/api/admin/user/email/', methods=['PUT'])
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
@admin_endpoints.route('/api/admin/user/vm/', methods=['GET'])
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

@admin_endpoints.route('/api/admin/user/ban/', methods=['PUT'])
@jwt_required()
def ban_user():
    """Ban a user with an optional reason and duration

    Returns:
        json: Message
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

    # Get the ban reason from the request
    if 'ban_reason' not in data:
        data['ban_reason'] = None

    # Ban the user by moving them to the banned users table
    banned_user = BannedUser(
        user_id=user.id,
        username=user.username,
        email=user.email,
        password=user.password,
        login_time=user.login_time,
        ip=user.ip,
        role=user.role,
        ban_reason=data['ban_reason']
    )

    db.session.add(banned_user)
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User banned'}), 200

@admin_endpoints.route('/api/admin/user/unban/', methods=['PUT'])
@jwt_required()
def unban_user():
    """Unban a user by moving them back to the users table

    Returns:
        json: Message
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
    banned_user = BannedUser.query.filter_by(id=data['user_id']).first()
    if not banned_user:
        return jsonify({'message': 'Invalid user'}), 404

    # Unban the user by moving them back to the users table
    user = User(
        username=banned_user.username,
        email=banned_user.email,
        password=banned_user.password,
        login_time=banned_user.login_time,
        ip=banned_user.ip,
        role=banned_user.role
    )

    db.session.add(user)
    db.session.delete(banned_user)
    db.session.commit()

    return jsonify({'message': 'User unbanned'}), 200

@admin_endpoints.route('/api/admin/user/banned/', methods=['GET'])
@jwt_required()
def get_banned_users():
    """Get all banned users

    Returns:
        json: List of banned users
    """
    
    # Get the user from the authorization token
    admin = User.query.filter_by(id=get_jwt_identity()).first()
    if not admin:
        return jsonify({'message': 'Invalid user'}), 401
    
    # Ensure the user is an admin
    if admin.role != 'admin':
        return jsonify({'message': 'Insufficient permissions'}), 403

    # Get all banned users
    banned_users = BannedUser.query.all()
    if not banned_users:
        return jsonify({'message': 'No banned users'}), 404

    banned_users_list = []
    for banned_user in banned_users:
        banned_users_list.append({
            'id': banned_user.id,
            'user_id': banned_user.user_id,
            'username': banned_user.username,
            'email': banned_user.email,
            'login_time': banned_user.login_time,
            'ip': banned_user.ip,
            'role': banned_user.role,
            'ban_reason': banned_user.ban_reason
        })

    return jsonify(banned_users_list), 200

@admin_endpoints.route('/api/admin/user/banned/delete/', methods=['DELETE'])
@jwt_required()
def delete_banned_user():
    """Delete a banned user (effectively perma-ban)

    Returns:
        json: Message
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
    banned_user = BannedUser.query.filter_by(id=data['user_id']).first()
    if not banned_user:
        return jsonify({'message': 'Invalid user'}), 404

    db.session.delete(banned_user)
    db.session.commit()

    return jsonify({'message': 'Banned user deleted'}), 200