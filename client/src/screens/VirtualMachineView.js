import React, { useCallback, useEffect, useState } from "react";
import RFB from "@novnc/novnc/core/rfb";
import { Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import VirtualMachineAPI from "../api/VirtualMachineAPI";

// The user should be able to navigate to this page by clicking on a VM on the home page
// The url schema should be /vm/

function VirtualMachineView() {
    const [wsport, setWebsocketPort] = useState(0);
    const [virtualMachineId, setVirtualMachineId] = useState(0);
    const [showModal, setShowModal] = useState(true);
    const [iso, setIso] = useState('');
    const inactivityTimeout = 500000;

    // If no user id can be found, redirect to the home page
    useEffect(() => {
        // Set the title of the page to 'Buffet' + the iso running on the VM
        document.title = 'Buffet - ' + iso;
    }, [iso]); // Include 'iso' in the dependency array

    // Get the wsport, vm id, and iso from the API
    // If no wsport can be found, redirect to the home page
    useEffect(() => {
        const getPort = async () => {
            const response = await VirtualMachineAPI.getVirtualMachineByUser();
            setWebsocketPort(response.data.wsport);
            setVirtualMachineId(response.data.id);
            setIso(response.data.iso);
        };
        getPort();
    }, []);

    const deleteVM = useCallback(() => {
        VirtualMachineAPI.deleteVirtualMachine(virtualMachineId).then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            }
        });
    }, [virtualMachineId]); // Include 'virtualMachineId' in the dependency array

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
            VirtualMachineAPI.deleteVirtualMachine().then((response) => {
                if (response.status === 200) {
                    window.location.href = '/';
                }
            });
        }, inactivityTimeout);
        window.addEventListener('mousemove', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                VirtualMachineAPI.deleteVirtualMachine(virtualMachineId).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/';
                    }
                });
            }, inactivityTimeout);
        });
        window.addEventListener('keypress', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                VirtualMachineAPI.deleteVirtualMachine(virtualMachineId).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/';
                    }
                });
            }, inactivityTimeout);
        });
    }, [virtualMachineId, inactivityTimeout]); // Include 'virtualMachineId' and 'inactivityTimeout' in the dependency array

    const connect = useCallback(() => {
        // Create RFB connection object
        const rfb = new RFB(document.getElementById('app'), 'ws://localhost:' + wsport, {});
        rfb.scaleViewport = true;
        rfb.resizeSession = true;


        rfb.addEventListener("disconnect", function () {
            // On disconnect, redirect to the home page and shut down the VM
            // Shut down the VM if the user disconnects naturally or closes the tab
            VirtualMachineAPI.deleteVirtualMachine(virtualMachineId).then((response) => {
                if (response.status === 200) {
                    window.location.href = '/';
                }
            });
            // If the virtual machine is remotely shut down by an admin, redirect to the home page
            window.location.href = '/';
        }, false);
    }, [wsport, virtualMachineId]); // Include 'port' and 'virtualMachineId' in the dependency array

    // Run connect() when the port is set
    useEffect(() => {
        if (wsport) {
            connect();
        }
    }, [wsport, connect]); // Include 'wsport' and 'connect' in the dependency array

    return (
        // Take up full screen
        <div>
            {/* If user is logged in, display the page, otherwise redirect to the login page */}
            {/* Display the VM */}
            <div id="app" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}></div>
            {/* Display three buttons: on the left hand side of the screen vertically, display the home button and the shutdown button, on the right hand side of the screen vertically, display the fullscreen button */}
            <Card style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'transparent', border: 'none' }}>
                <Card.Body>
                    <ButtonGroup>
                        <Button variant="primary" onClick={() => fullscreen()}>Full Screen</Button>
                        <Button variant="danger" onClick={() => deleteVM()}>Shutdown</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
            {/* Display a modal with details about how the project is still in development */}
            <Modal show={showModal} onHide={() => setShowModal(false)} >
                <Modal.Header closeButton>
                    <Modal.Title>For Your Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Buffet is currently in development.</p>
                    <p>Some features may not work as expected.</p>
                    <p>Please report any bugs on GitHub.</p>
                </Modal.Body>
                {/* Add confirmation button to the modal */}
                <Modal.Footer>
                    <Button variant="primary" href="https://github.com/kgdn/issues/new" target="_blank" rel="noreferrer">Report Bug</Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div >
    );
}

export default VirtualMachineView;