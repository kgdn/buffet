import React, { useCallback, useEffect, useState } from "react";
import RFB from "@novnc/novnc/core/rfb";
import { Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import VirtualMachineAPI from "../api/VirtualMachineAPI";

function VirtualMachineView() {
    const [wsport, setWebsocketPort] = useState(0);
    const [virtualMachineId, setVirtualMachineId] = useState(0);
    const [showModal, setShowModal] = useState(true);
    const [iso, setIso] = useState('');
    const inactivityTimeout = 500000;

    useEffect(() => {
        const getPort = async () => {
            const response = await VirtualMachineAPI.getVirtualMachineByUser();
            setWebsocketPort(response.data.wsport);
            setVirtualMachineId(response.data.id);
            setIso(response.data.iso);
        };
        getPort();

        document.title = 'Buffet - ' + iso;
    }, [iso]);

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
    }, [virtualMachineId, inactivityTimeout]);


    // Handle reloading and leaving the page. If the user opens the page in a new tab, keep the VM running in that tab. If the user closes the tab, shut down the VM.
    useEffect(() => {
        const handleUnload = () => {
            deleteVM();
        };
        window.addEventListener('unload', handleUnload);
        return () => {
            window.removeEventListener('unload', handleUnload);
        };
    }, [virtualMachineId]);

    // Connect to the VM
    useEffect(() => {
        if (wsport) { // If the websocket port is not 0 then connect to the VM
            const rfb = new RFB(document.getElementById('app'), 'ws://localhost:' + wsport, {});
            rfb.scaleViewport = true;
            rfb.resizeSession = true;

            // If the VM is connected, log a message to the console to indicate that the VM is connected
            rfb.addEventListener("connect", () => {
                console.log("Successfully connected to the VM");
                // Once the VM is connected, listen for the disconnect event so that the VM can be shut down
                rfb.addEventListener("disconnect", () => {
                    console.log("Disconnected from the VM");
                    deleteVM();
                });
            });
        }
    }, [wsport, virtualMachineId]);

    return (
        <div>
            <div id="app" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}></div>
            <Card style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'transparent', border: 'none' }}>
                <Card.Body>
                    <ButtonGroup>
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
                    <p>Buffet is currently in development.</p>
                    <p>Some features may not work as expected.</p>
                    <p>Please report any bugs on GitHub.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" href="https://github.com/kgdn/issues/new" target="_blank" rel="noreferrer">Report Bug</Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div >
    );
}

export default VirtualMachineView;