# vm_endpoints.py - Contains the admin endpoints for the server.
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

import asyncio
import base64
import json
import os
import re
import random
import subprocess
import socket
from datetime import datetime

from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Users, VirtualMachines, db
from config import ApplicationConfig
from qemu.qmp import QMPClient

load_dotenv()

vm_endpoints = Blueprint("vm", __name__)


def create_random_vnc_password():
    """Generates a random password for VNC connections. Note that this password is not hashed or salted.

    Returns:
        str: Random VNC password
    """
    return "".join(
        random.choices(
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()",
            k=16,
        )
    )


def get_host_os_type():
    """Get the host OS type."""
    return os.uname().sysname


def get_hardware_platform():
    """Get the hardware platform."""
    return os.uname().machine


@vm_endpoints.route("/api/vm/iso/", methods=["GET"])
@jwt_required()
def index_vm():
    """Index the ISO files

    Returns:
        json: Index of the ISO files with logos
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    with open(f"{ApplicationConfig.ISO_DIR}/index.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for iso in data:
            logo_path = f"{ApplicationConfig.ISO_DIR}/logos/{iso['logo']}"
            if os.path.exists(logo_path):
                with open(logo_path, "rb") as f:
                    iso["logo"] = base64.b64encode(f.read()).decode("utf-8")
            else:
                with open("assets/unknown.png", "rb") as f:
                    iso["logo"] = base64.b64encode(f.read()).decode("utf-8")

    return jsonify(data), 200


@vm_endpoints.route("/api/vm/create/", methods=["POST"])
@jwt_required()
async def create_vm():
    """Create a virtual machine

    Returns:
        json: Virtual machine
    """
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    data = request.get_json()
    if not data or "iso" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    iso = data["iso"]

    # Get the ISO architecture
    arch = get_iso_architecture(iso)
    if not arch:
        return jsonify({"message": "Invalid ISO"}), 404

    port_int = find_available_port()
    if port_int is None:
        return jsonify({"message": "The server is at maximum capacity. Please try again later."}), 500

    wsport, port = port_int + int(ApplicationConfig.WEBSOCKET_PORT_START), port_int + int(ApplicationConfig.VM_PORT_START)

    # Check if user already has a virtual machine
    if VirtualMachines.query.filter_by(user_id=user.id).count() > 0:
        return jsonify({
            "message": "Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one."
        }), 403

    try:
        create_log_directory(user.id)
        iso_dir = f"{ApplicationConfig.ISO_DIR}/{iso}"
        validate_iso(iso_dir)

        # Start the virtual machine process
        process_id = start_vm_process(arch, iso_dir, port_int, user.id)

        # If the host OS is not macOS, setup QMP and VNC password
        password = None
        if get_host_os_type() != "Darwin":
            # Wait for VM to start
            await asyncio.sleep(2)

            # Setup QMP and VNC password
            qmp = await setup_qmp_client(user.id)
            password = create_random_vnc_password()
            await qmp.execute("set_password", {"protocol": "vnc", "password": password})

        # Start websockify process
        websockify_process_id = start_websockify(wsport, port)

    except subprocess.CalledProcessError:
        return jsonify({"message": "Critical error creating virtual machine. Please try again later."}), 500

    # Create the VM in the database
    new_vm = VirtualMachines(
        port=port,
        wsport=wsport,
        iso=iso,
        websockify_process_id=websockify_process_id,
        process_id=process_id,
        user_id=user.id,
        log_file=f"{datetime.now().strftime('%H:%M:%S')}-{iso}.pcap",
        vnc_password=password,
    )
    db.session.add(new_vm)
    db.session.commit()

    return jsonify({"id": new_vm.id, "wsport": wsport, "iso": iso, "user_id": user.id}), 201


def get_iso_architecture(iso):
    """Retrieve the architecture of a given ISO."""
    with open(f"{ApplicationConfig.ISO_DIR}/index.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for iso_data in data:
            if iso_data["iso"] == iso:
                return iso_data["arch"]
    return None


def find_available_port():
    """Find the next available VM port."""
    max_count = int(ApplicationConfig.MAX_VM_COUNT)
    for port_int in range(max_count):
        if not VirtualMachines.query.filter_by(port=port_int + int(ApplicationConfig.WEBSOCKET_PORT_START)).first():
            return port_int
    return None


def create_log_directory(user_id):
    """Create a log directory for the user if it doesn't exist."""
    log_dir = f"logs/{datetime.now().date()}/{user_id}"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)


def validate_iso(iso_dir):
    """Validate if the ISO file exists."""
    if not os.path.exists(iso_dir):
        raise FileNotFoundError(f"ISO file not found: {iso_dir}")


def start_vm_process(arch, iso_dir, port_int, user_id):
    """Start the virtual machine process."""
    command = [
        f"qemu-system-{arch}",
        "-monitor",
        "stdio",
        "-m",
        f"{ApplicationConfig.MAX_VM_MEMORY}M",
        "-smp",
        str(int(ApplicationConfig.MAX_VM_CORES)),
        "-device",
        "virtio-balloon",
        "-drive",
        f"file={iso_dir},format=raw,media=cdrom" if re.search(r"\.iso$", iso_dir) else f"file={iso_dir},format=raw",
        "-netdev",
        "user,id=net0",
        "-device",
        "virtio-net,netdev=net0",
        "-device",
        "virtio-rng-pci",
        "-device",
        "qemu-xhci",
        "-object",
        f"filter-dump,id=f1,netdev=net0,file=logs/{datetime.now().date()}/{user_id}/{datetime.now().strftime('%H:%M:%S')}-{iso_dir.split('/')[-1]}.pcap",
        "-vnc",
        f":{port_int},to={ApplicationConfig.MAX_VM_COUNT},password=on"
        if get_host_os_type() != "Darwin"
        else f":{port_int},to={ApplicationConfig.MAX_VM_COUNT},password=off",
        "-qmp",
        f"unix:/tmp/qmp-{user_id}.sock,server,wait=off",
    ]

    # If KVM is enabled, add the KVM flag
    if ApplicationConfig.KVM_ENABLED:
        command.extend(["-enable-kvm", "-cpu", "host"])

    # Add HVF accelerator if running on macOS with an M series chip, and ISO is ARM64
    if get_host_os_type() == "Darwin" and get_hardware_platform() == "arm64" and arch == "aarch64":
        # get the latest version of qemu by searching for the latest version in the directory
        command.extend(["-machine", "virt,accel=hvf", "-device", "virtio-gpu-pci"])
    # Add HAXM accelerator if running on macOS with an Intel chip
    elif get_host_os_type() == "Darwin" and get_hardware_platform() == "x86_64":
        command.extend(["-machine", "q35,accel=hax", "-device", "virtio-gpu-pci"])
    elif get_host_os_type() == "Linux" and arch == "x86_64" and not ApplicationConfig.KVM_ENABLED:
        # Use standard QEMU VGA if running on Linux
        command.extend(["-cpu", "qemu64", "-device", "virtio-vga"])

    # Print the command for debugging
    print("Executing command:", " ".join(command))

    process = subprocess.Popen(command)

    return process.pid


async def setup_qmp_client(user_id):
    """Setup QMP client for the virtual machine."""
    qmp = QMPClient(f"virtual-machine-{user_id}")
    await qmp.connect(f"/tmp/qmp-{user_id}.sock")
    return qmp


def start_websockify(wsport, port):
    """Start the websockify process."""
    client_url = ApplicationConfig.CLIENT_URL
    api_url = socket.gethostbyname(socket.gethostname())

    if ApplicationConfig.SSL_ENABLED:
        cert_path = ApplicationConfig.SSL_CERTIFICATE_PATH
        key_path = ApplicationConfig.SSL_KEY_PATH

        process = subprocess.Popen([
            "websockify",
            "--cert",
            cert_path,
            "--key",
            key_path,
            "--ssl-only",
            f"{client_url}:{wsport}",
            f"{api_url}:{port}",
        ])
    else:
        process = subprocess.Popen(["websockify", f"{client_url}:{wsport}", f"{api_url}:{port}"])
    return process.pid


@vm_endpoints.route("/api/vm/delete/", methods=["DELETE"])
@jwt_required()
def delete_vm():
    """Stop a virtual machine

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    data = request.get_json()
    if not data or "vm_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    vm = VirtualMachines.query.filter_by(id=data["vm_id"]).first()
    if not vm:
        return jsonify({"message": "Invalid virtual machine"}), 404

    # Ensure the user is deleting their own virtual machine
    if vm.user_id != user.id:
        return jsonify({"message": "You can only delete your own virtual machine"}), 403

    # Stop the virtual machine
    try:
        subprocess.Popen(
            ["kill", str(vm.websockify_process_id)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        subprocess.Popen(["kill", str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError:
        return jsonify({"message": "Error deleting virtual machine"}), 500

    # Stop the virtual machine from the database
    db.session.delete(vm)
    db.session.commit()

    return jsonify({"message": "Virtual machine deleted"}), 200


@vm_endpoints.route("/api/vm/user/", methods=["GET"])
@jwt_required()
def get_user_vm():
    """Get the virtual machine of the user

    Returns:
        json: Virtual machine
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the user's virtual machine
    vm = VirtualMachines.query.filter_by(user_id=user.id).first()
    if not vm:
        return jsonify({"message": "Invalid virtual machine"}), 404

    name = None
    version = None
    desktop = None

    # Get the name of the operating system, version and desktop environment
    with open(f"{ApplicationConfig.ISO_DIR}/index.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for iso in data:
            if iso["iso"] == vm.iso:
                name = iso["name"]
                version = iso["version"]
                desktop = iso["desktop"]
                homepage = iso["homepage"]
                desktop_homepage = iso.get("desktop_homepage", None)
                break

    return (
        jsonify({
            "id": vm.id,
            "wsport": vm.wsport,
            "iso": vm.iso,
            "user_id": vm.user_id,
            "name": name,
            "version": version,
            "desktop": desktop,
            "vnc_password": vm.vnc_password,
            "homepage": homepage,
            "desktop_homepage": desktop_homepage,
        }),
        201,
    )


@vm_endpoints.route("/api/vm/", methods=["GET"])
@jwt_required()
def get_vm_by_id():
    """Get the virtual machine by id

    Returns:
        json: Virtual machine
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the virtual machine id from the request
    data = request.get_json()
    if not data or "vm_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the virtual machine, if it exists
    vm = VirtualMachines.query.filter_by(id=data["vm_id"]).first()
    if not vm:
        return jsonify({"message": "Invalid virtual machine"}), 404

    # Ensure the user is getting their own virtual machine
    if vm.user_id != user.id:
        return jsonify({"message": "You can only get your own virtual machine"}), 403

    return (
        jsonify({"id": vm.id, "wsport": vm.wsport, "iso": vm.iso, "user_id": vm.user_id}),
        200,
    )


@vm_endpoints.route("/api/vm/count/", methods=["GET"])
@jwt_required()
def get_vm_count():
    """Get the number of virtual machines

    Returns:
        json: Number of virtual machines
    """

    # Get the user from the authorization token
    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the number of virtual machines
    vm_count = VirtualMachines.query.count()

    return jsonify({"vm_count": vm_count}), 200
