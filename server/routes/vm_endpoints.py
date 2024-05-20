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
import random
import subprocess
from datetime import datetime

import cef
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from helper_functions import HelperFunctions
from models import User, VirtualMachine, db
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


@vm_endpoints.route("/api/vm/iso/", methods=["GET"])
@jwt_required()
def index_vm():
    """Index the iso/index.json file

    Returns:
        json: Index of the iso/index.json file
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    with open("iso/index.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for iso in data:
            logo_path = "iso/logos/" + iso["logo"]
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

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    data = request.get_json()
    if not data or "iso" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    iso = data["iso"]

    if not os.path.exists("iso/" + iso):
        return jsonify({"message": "Invalid ISO"}), 404

    # Get the next available port
    port_int = 0
    while port_int <= int(os.getenv("MAX_VM_COUNT")) - 1:
        if not VirtualMachine.query.filter_by(port=port_int + 5900).first():
            break
        port_int += 1

    # If there are no available ports, throw an error
    if port_int > int(os.getenv("MAX_VM_COUNT")) - 1:
        return jsonify({"message": "No available ports. Please try again later."}), 500

    wsport = port_int + 5700
    port = port_int + 5900

    # If the user has more than one virtual machine at a time, throw an error
    if VirtualMachine.query.filter_by(user_id=user.id).count() > 0:
        return (
            jsonify(
                {
                    "message": "Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one."
                }
            ),
            403,
        )
    try:
        if not os.path.exists(
            "logs/" + str(datetime.now().date()) + "/" + str(user.id)
        ):
            os.makedirs("logs/" + str(datetime.now().date()) + "/" + str(user.id))

        # Start websockify to enable VNC over WebSocket
        front_end_address = os.getenv("FRONT_END_ADDRESS")
        back_end_address = os.getenv("BACK_END_ADDRESS")
        cert_path = os.getenv("SSL_CERTIFICATE_PATH")
        key_path = os.getenv("SSL_KEY_PATH")

        # Create the virtual machine
        process = subprocess.Popen(
            [
                "qemu-system-x86_64",
                "-monitor",
                "stdio",
                "-m",
                "2048M",  # 2GB of RAM
                "-cpu",
                "host",  # Use the host CPU
                "-smp",
                "2",  # 2 cores
                "-enable-kvm",  # Enable KVM (hypervisor)
                "-device",
                "virtio-balloon",  # Enable virtio-balloon for memory ballooning (dynamic memory allocation)
                "-cdrom",
                "iso/" + iso,  # The ISO to boot from, specified in the request
                "-vga",
                "virtio",  # Use the virtio graphics card
                "-netdev",
                "user,id=net0",  # Create a user network device with the id 'net0'
                "-device",
                "virtio-net,netdev=net0",  # Use the virtio network card
                "-object",
                "filter-dump,id=f1,netdev=net0,file=logs/"
                + str(datetime.now().date())
                + "/"
                + str(user.id)
                + "/"
                + str(
                    datetime.now().strftime("%H:%M:%S") + "-" + str(iso) + ".pcap"
                ),  # Create a filter-dump object to log network traffic
                "-vnc",
                ":" + str(port_int) + ",to=5,password=on",
                "-qmp",
                "unix:/tmp/qmp-" + str(user.id) + ".sock,server,wait=off",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        process_id = process.pid

        # Wait for the virtual machine to start
        await asyncio.sleep(0.1)

        # Set the QMP client
        qmp = QMPClient("virtual-machine-" + str(user.id))
        await qmp.connect("/tmp/qmp-" + str(user.id) + ".sock")

        # Set the VNC password
        password = create_random_vnc_password()
        await qmp.execute("set_password", {"protocol": "vnc", "password": password})

        # Start websockify to enable VNC over WebSocket
        websockify_process = subprocess.Popen(
            [
                "websockify",
                "--cert",
                cert_path,
                "--key",
                key_path,
                "--ssl-only",
                front_end_address + ":" + str(wsport),
                back_end_address + ":" + str(port),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        websockify_process_id = websockify_process.pid

    except subprocess.CalledProcessError as e:
        return (
            jsonify(
                {
                    "message": "Critical error creating virtual machine. Details: "
                    + str(e)
                }
            ),
            500,
        )

    # Create the virtual machine in the database
    new_vm = VirtualMachine(
        port=port,
        wsport=wsport,
        iso=iso,
        websockify_process_id=websockify_process_id,
        process_id=process_id,
        user_id=user.id,
        log_file=str(datetime.now().strftime("%H:%M:%S") + "-" + str(iso) + ".pcap"),
        vnc_password=password,
    )
    db.session.add(new_vm)
    db.session.commit()

    # Log the request to cef.log
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef(
        "Virtual machine created with ISO " + iso,
        2,
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

    return (
        jsonify({"id": new_vm.id, "wsport": wsport, "iso": iso, "user_id": user.id}),
        201,
    )


@vm_endpoints.route("/api/vm/delete/", methods=["DELETE"])
@jwt_required()
def delete_vm():
    """Stop a virtual machine

    Returns:
        json: Message
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    data = request.get_json()
    if not data or "vm_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    vm = VirtualMachine.query.filter_by(id=data["vm_id"]).first()
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
        subprocess.Popen(
            ["kill", str(vm.process_id)], stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
    except subprocess.CalledProcessError:
        return jsonify({"message": "Error deleting virtual machine"}), 500

    # Stop the virtual machine from the database
    db.session.delete(vm)
    db.session.commit()

    # Log the request to cef.log
    HelperFunctions.create_cef_logs_folders()

    cef.log_cef(
        "Virtual machine deleted",
        2,
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


@vm_endpoints.route("/api/vm/user/", methods=["GET"])
@jwt_required()
def get_user_vm():
    """Get the virtual machine of the user

    Returns:
        json: Virtual machine
    """

    # Get the user from the authorization token
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the user's virtual machine
    vm = VirtualMachine.query.filter_by(user_id=user.id).first()
    if not vm:
        return jsonify({"message": "Invalid virtual machine"}), 404

    name = None
    version = None
    desktop = None

    # Get the name of the operating system, version and desktop environment
    with open("iso/index.json", "r", encoding="utf-8") as f:
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
        jsonify(
            {
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
            }
        ),
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
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the virtual machine id from the request
    data = request.get_json()
    if not data or "vm_id" not in data:
        return jsonify({"message": "Invalid data format"}), 400

    # Get the virtual machine, if it exists
    vm = VirtualMachine.query.filter_by(id=data["vm_id"]).first()
    if not vm:
        return jsonify({"message": "Invalid virtual machine"}), 404

    # Ensure the user is getting their own virtual machine
    if vm.user_id != user.id:
        return jsonify({"message": "You can only get your own virtual machine"}), 403

    return (
        jsonify(
            {"id": vm.id, "wsport": vm.wsport, "iso": vm.iso, "user_id": vm.user_id}
        ),
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
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "Invalid user"}), 401

    # Get the number of virtual machines
    vm_count = VirtualMachine.query.count()

    return jsonify({"vm_count": vm_count}), 200
