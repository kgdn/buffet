/*
* VirtualMachineView.tsx - Virtual machine view for the application using noVNC.
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

interface VmDetails {
    wsport: number;
    id: number;
    name: string;
    version: string;
    desktop: string;
    password: string;
}

const VirtualMachineView: React.FC = () => {
    const [vmDetails, setVmDetails] = useState<VmDetails>({ wsport: 0, id: 0, name: '', version: '', desktop: '', password: '' });
    const [showModal, setShowModal] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_BASE_URL.replace(/(^\w+:|^)\/\//, '');

    /**
     * Fetches the virtual machine details from the database
     * @param {void} - No parameters
     * @returns {void} - No return value
     */
    useEffect(() => {
        const fetchVMDetails = async () => {
            const { data } = await VirtualMachineAPI.getVirtualMachineByUser();
            setVmDetails({
                wsport: data.wsport,
                id: data.id,
                name: data.name,
                version: data.version,
                desktop: data.desktop,
                password: data.vnc_password
            });
        };
        fetchVMDetails();
    }, []);


    /**
     * Sets the document title to the virtual machine name, version, and desktop, and handles keydown events
     * @param {void} - No parameters
     * @returns {void} - No return value
     */
    useEffect(() => {
        document.title = `${vmDetails.name} ${vmDetails.version} ${vmDetails.desktop} - Buffet`;

        window.addEventListener('keydown', handleKeyDown);
    });


    /**
     * Deletes the virtual machine from the database and redirects the user to the home page
     * @param {number} id - The ID of the virtual machine to delete
     * @returns {void} - No return value
     */
    const deleteVM = useCallback(() => {
        VirtualMachineAPI.deleteVirtualMachine(String(vmDetails.id)).then(() => {
            window.location.href = '/';
        });
    }, [vmDetails.id]);

    /**
    * Handles the keydown event. If the key is F11, it toggles fullscreen mode.
    * @callback handleKeyDown
    * @param {KeyboardEvent} event - The keydown event
    * @returns {void} - No return value
    */
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'F11') {
            event.preventDefault();
            handleFullscreen();
        }
    }, []);

    /**
    * Toggles fullscreen mode. If the document is currently in fullscreen mode, it exits fullscreen mode. Otherwise, it enters fullscreen mode.
    * @function handleFullscreen
    * @returns {void} - No return value
    */
    const handleFullscreen = () => {
        const elem = document.getElementById('app')!;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            elem.requestFullscreen();
        }
    };

    /**
     * Connects to the virtual machine using noVNC
     * @param {void} - No parameters
     * @returns {void} - No return value
     */
    const connectToVM = useCallback(() => {
        const rfb = new RFB(document.getElementById('app')!, `wss://${API_BASE_URL}:${vmDetails.wsport}`, {
            credentials: { username: '', password: vmDetails.password, target: '' }
        });
        rfb.scaleViewport = true;
        rfb.resizeSession = true;
        rfb.focusOnClick = true;

        // When the connection is established, focus on the virtual machine
        rfb.addEventListener("connect", () => {
            rfb.focus();
            rfb.addEventListener("disconnect", () => {
                deleteVM();
            });
        });
    }, [API_BASE_URL, deleteVM, vmDetails.password, vmDetails.wsport]);

    /**
     * Connect to the virtual machine when the wsport is set
     */
    useEffect(() => {
        if (vmDetails.wsport !== 0) {
            const timeout = setTimeout(connectToVM, 200);
            return () => clearTimeout(timeout);
        }
    }, [connectToVM, vmDetails.wsport]);

    return (
        <div id="virtual-machine-view">

            {/* noVNC viewer */}
            <div id="app" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }} />

            {/* Card for information */}
            <Card style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'transparent', border: 'none' }}>
                <Card.Body>
                    <ButtonGroup>
                        <Button variant="info" onClick={() => setShowModal(true)}>Information</Button>
                        <Button variant="primary" onClick={handleFullscreen}>Fullscreen</Button>
                        <Button variant="danger" onClick={deleteVM}>Shutdown</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>

            {/* Modal for information */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
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
        </div>
    )
};

export default VirtualMachineView;
