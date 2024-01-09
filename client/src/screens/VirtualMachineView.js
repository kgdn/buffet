import React, { useCallback, useEffect } from "react";
import RFB from "@novnc/novnc/core/rfb";
import { Modal } from "react-bootstrap";
import VirtualMachineAPI from "../api/VirtualMachineAPI";
import 'bootstrap/dist/css/bootstrap.min.css';

// The user should be able to navigate to this page by clicking on a VM on the home page
// The url schema should be /vm/

function VirtualMachineView() {
    const [port, setPort] = React.useState(0);
    const [vm_id, setVm_id] = React.useState(0);
    const [iso, setIso] = React.useState('');
    const [showModal, setShowModal] = React.useState(true);
    const inactivityTimeout = 500000;

    // If no user id can be found, redirect to the home page
    useEffect(() => {
        // Set the title of the page to 'Buffet' + the iso running on the VM
        document.title = 'Buffet - ' + iso;
    }, [vm_id]); // Include 'vm_id' in the dependency array

    // Get the port, vm id, and iso from the API
    // If no port can be found, redirect to the home page
    useEffect(() => {
        const getPort = async () => {
            const response = await VirtualMachineAPI.getVirtualMachineByUser();
            setPort(response.data.wsport);
            setVm_id(response.data.id);
            setIso(response.data.iso);
        };
        getPort();
    }, []);

    const deleteVM = useCallback(() => {
        VirtualMachineAPI.deleteVirtualMachine(vm_id).then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            }
        });
    }, [vm_id]); // Include 'vm_id' in the dependency array

    // Handle reloading and leaving the page
    // Honestly I have no idea how this shit code works, but it does?
    useEffect(() => {
        const handleUnload = () => {
            deleteVM();
        };
        window.addEventListener('unload', handleUnload);
        return () => {
            window.removeEventListener('unload', handleUnload);
        };
    }, [vm_id]); // Include 'vm_id' in the dependency array

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
                VirtualMachineAPI.deleteVirtualMachine(vm_id).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/';
                    }
                });
            }, inactivityTimeout);
        });
        window.addEventListener('keypress', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                VirtualMachineAPI.deleteVirtualMachine(vm_id).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/';
                    }
                });
            }, inactivityTimeout);
        });
    }, [vm_id, inactivityTimeout]); // Include 'vm_id' and 'inactivityTimeout' in the dependency array

    const connect = useCallback(() => {
        // Create RFB connection object
        const rfb = new RFB(document.getElementById('app'), 'ws://localhost:' + port, {});
        rfb.scaleViewport = true;
        rfb.resizeSession = true;

        rfb.addEventListener("connect", function () {
            console.log("Connected on port " + port);
        }, false);

        rfb.addEventListener("disconnect", function () {
            // On disconnect, redirect to the home page and shut down the VM
            console.log("disconnected on port " + port);
            // Shut down the VM if the user disconnects naturally or closes the tab
            VirtualMachineAPI.deleteVirtualMachine(vm_id).then((response) => {
                if (response.status === 200) {
                    window.location.href = '/';
                }
            });
            // If the virtual machine is remotely shut down by an admin, redirect to the home page
            window.location.href = '/';
        }, false);
    }, [port, vm_id]); // Include 'port' and 'vm_id' in the dependency array

    // Run connect() when the port is set
    useEffect(() => {
        if (port) {
            connect();
        }
    }, [port, connect]); // Include 'port' and 'connect' in the dependency array

    return (
        // Take up full screen
        <div>
            {/* If user is logged in, display the page, otherwise redirect to the login page */}
            {/* Display the VM */}
            <div id="app" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}></div>
            {/* Display three buttons: on the left hand side of the screen vertically, display the home button and the shutdown button, on the right hand side of the screen vertically, display the fullscreen button */}
            <div className="card" style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'transparent', border: 'none' }}>
                <div className="card-body">
                    <div className="btn-group" role="group">
                        <button className="btn btn-primary" onClick={() => fullscreen()}>Full Screen</button>
                        <button className="btn btn-danger" onClick={() => deleteVM()}>Shutdown</button>
                    </div>
                </div>
            </div>
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
                    <a className="btn btn-primary" href="https://github.com/kgdn/buffet/issues/new" target="_blank" rel="noreferrer">Report Bug</a>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                </Modal.Footer>
            </Modal>
        </div >
    );
}

export default VirtualMachineView;