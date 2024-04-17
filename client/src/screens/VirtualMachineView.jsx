/*
* VirtualMachineView.jsx - Virtual machine view for the application utilising noVNC.
* Copyright (C) 2024, Kieran Gordon
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
* 
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import React, { useCallback, useEffect, useState } from "react";
import RFB from "@novnc/novnc/core/rfb";
import { Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import VirtualMachineAPI from "../api/VirtualMachineAPI";

function VirtualMachineView() {
    const [wsport, setWebsocketPort] = useState(0);
    const [virtualMachineId, setVirtualMachineId] = useState(0);
    const [showModal, setShowModal] = useState(true);
    const [name, setName] = useState('');
    const [version, setVersion] = useState('');
    const [desktop, setDesktop] = useState('');
    const inactivityTimeout = 500000;
    const API_BASE_URL = import.meta.env.VITE_BASE_URL;

    // strip http from the base url
    const strippedBaseUrl = API_BASE_URL.replace(/(^\w+:|^)\/\//, '');

    useEffect(() => {
        const getPort = async () => {
            const response = await VirtualMachineAPI.getVirtualMachineByUser();
            setWebsocketPort(response.data.wsport);
            setVirtualMachineId(response.data.id);
            setName(response.data.name);
            setDesktop(response.data.desktop);
            setVersion(response.data.version);
        };
        getPort();
    }, []);

    useEffect(() => {
        document.title = `${name} ${version} ${desktop} - Buffet`;
    }, [name, version, desktop]);

    const deleteVM = useCallback(() => {
        VirtualMachineAPI.deleteVirtualMachine(virtualMachineId).then(() => {
            window.location.href = '/';
        });
    }, [virtualMachineId]);

    const fullscreen = () => {
        const elem = document.getElementById('app');
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE 11 */
            elem.msRequestFullscreen();
        }
    }

    // If the user is inactive for 5 minutes, redirect to the home page and shut down the VM
    useEffect(() => {
        let timeout = setTimeout(() => {
            deleteVM();
        }, inactivityTimeout);
        window.addEventListener('mousemove', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                deleteVM();
            }, inactivityTimeout);
        });
        window.addEventListener('keypress', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                deleteVM();
            }, inactivityTimeout);
        });
    }, [virtualMachineId, inactivityTimeout, deleteVM]);

    // Connect to the VM
    const connectToVM = useCallback(() => {
        const rfb = new RFB(document.getElementById('app'), 'wss://' + strippedBaseUrl + ':' + wsport, {});
        rfb.scaleViewport = true;
        rfb.resizeSession = true;
        rfb.focusOnClick = true;

        // If the VM is connected, log a message to the console to indicate that the VM is connected
        rfb.addEventListener("connect", () => {
            console.log("Successfully connected to the VM");
            // Once the VM is connected, listen for the disconnect event so that the VM can be shut down
            rfb.addEventListener("disconnect", () => {
                console.log("Disconnected from the VM");
                deleteVM();
            });
        });
    }, [wsport, strippedBaseUrl, deleteVM]);

    // Connect to the VM after 500ms
    useEffect(() => {
        setTimeout(() => {
            connectToVM();
        }, 250);
    }, [connectToVM]);

    // Render the virtual machine view
    return (
        <div id="virtual-machine-view">
            <div id="app" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }} />
            <Card style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'transparent', border: 'none' }}>
                <Card.Body>
                    <ButtonGroup>
                        <Button variant="warning" onClick={() => setShowModal(true)}>Info</Button>
                        <Button variant="primary" onClick={() => fullscreen()}>Full Screen</Button>
                        <Button variant="danger" onClick={() => deleteVM()}>Shutdown</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
            <Modal show={showModal} onHide={() => setShowModal(false)} >
                <Modal.Header closeButton>
                    <Modal.Title>For Your Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Buffet is currently in development. Some features may not work as expected. If you find a bug, please report it on GitHub.</p>
                    <p>Due to technical limitations, you need to click the viewer to interact with the virtual machine.</p>
                    <p>Your virtual machine will be shut down after 5 minutes of inactivity.</p>
                    <p><strong>Please note:</strong> All internet traffic is logged, and can be viewed by the system administrator. Any misuse of the system will result in your account being terminated.</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="secondary" href="https://github.com/kgdn/buffet/issues/new" target="_blank" rel="noreferrer">Report Bug</Button>
                        <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
        </div >
    );
}

export default VirtualMachineView;