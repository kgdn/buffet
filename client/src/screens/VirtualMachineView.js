import React from "react";
import RFB from "@novnc/novnc/core/rfb";
import AccountsAPI from "../api/AccountsAPI";
import VirtualMachineAPI from "../api/VirtualMachineAPI";
import { useParams } from "react-router-dom";

// The user should be able to navigate to this page by clicking on a VM on the home page
// The url schema should be /vm/:user_id/:vm_id

function VirtualMachineView() {
    // Get the WS port from the API
    // Connect to the VNC server using the WS port
    // If the connection is successful, display the VNC viewer
    // If the connection is unsuccessful, display the error message

    const [port, setPort] = React.useState(0);

    // Get user id from the url
    const { user_id } = useParams();

    React.useEffect(() => {
        const getPort = async () => {
            const response = await VirtualMachineAPI.getVirtualMachineByUser(user_id);
            setPort(response.data.wsport);
        }
        getPort();
    }, []);

    React.useEffect(() => {
        function connect() {
            // Create RFB connection object
            const rfb = new RFB(document.getElementById('app'), `ws://localhost:${port}`, {});
            rfb.scaleViewport = true;
            rfb.resizeSession = true;

            rfb.addEventListener("connect", function (e) {
                console.log("connected: " + e.detail.host + ":" + e.detail.port);
            }, false);

            rfb.addEventListener("disconnect", function (e) {
                console.log("disconnected: " + e.detail.clean);
            }, false);
        }
        connect();
    }, [port]);

    return (
        <div id="app"></div>
    );
}

export default VirtualMachineView;