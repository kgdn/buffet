import React from "react";
import RFB from "@novnc/novnc/core/rfb";
import VirtualMachineAPI from "../api/VirtualMachineAPI";
import { useParams } from "react-router-dom";
import NavbarComponent from "../components/Navbar";

// The user should be able to navigate to this page by clicking on a VM on the home page
// The url schema should be /vm/:user_id/:vm_id

function VirtualMachineView() {
    // Get the WS port from the API
    // Connect to the VNC server using the WS port
    // If the connection is successful, display the VNC viewer
    // If the connection is unsuccessful, display the error message

    const [port, setPort] = React.useState(0);
    const [vm_id, setVm_id] = React.useState(0);

    // Get user id and vm id from the url
    const { user_id } = useParams();

    React.useEffect(() => {
        if (!port) {
            const getPort = async () => {
                const response = await VirtualMachineAPI.getVirtualMachineByUser(user_id);
                setPort(response.data.wsport);
            };
            getPort();
        }
    }, [user_id, port]); // Include 'user_id' and 'port' in the dependency array

    React.useEffect(() => {
        if (!vm_id) {
            const getVm_id = async () => {
                const response = await VirtualMachineAPI.getVirtualMachineByUser(user_id);
                setVm_id(response.data.id);
            };
            getVm_id();
        }
    }, [user_id, vm_id]); // Include 'user_id' and 'vm_id' in the dependency array


    function connect() {
        // Create RFB connection object
        const rfb = new RFB(document.getElementById('app'), 'ws://localhost:' + port, {});
        rfb.scaleViewport = true;
        rfb.resizeSession = true;

        rfb.addEventListener("connect", function (e) {
            console.log("connected");
        }, false);

        rfb.addEventListener("disconnect", function (e) {
            // On disconnect, redirect to the home page and shut down the VM
            console.log("disconnected");
            VirtualMachineAPI.deleteVirtualMachine(vm_id).then((response) => {
                if (response.status === 200) {
                    window.location.href = '/';
                }
            });
        }, false);
    }

    // Run connect() when the port is set
    React.useEffect(() => {
        if (port) {
            connect();
        }
    }, [port, connect]); // Include 'port' and 'connect' in the dependency array

    return (
        // Take up full screen
        <div>
            <NavbarComponent />
            <div id="app" style={{ height: '100vh' }}></div>
        </div>
    );
}

export default VirtualMachineView;