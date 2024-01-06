import React, { useEffect } from 'react';
import NavbarComponent from '../components/Navbar';
import RFB from '@novnc/novnc/core/rfb';
import VirtualMachineAPI from '../api/VirtualMachineAPI';

// Reference file
function VMView() {
    useEffect(() => {
        function connect() {
            // VNC server - port 5900
            // Websocket port - 5700 + display number

            // Create RFB connection object
            const rfb = new RFB(document.getElementById('app'), 'ws://localhost:5700', {});
            rfb.scaleViewport = true;
            rfb.resizeSession = true;

            rfb.addEventListener("connect", function (e) {
                console.log("connected: " + e.detail.host + ":" + e.detail.port);
            }, false);

            rfb.addEventListener("disconnect", function (e) {
                console.log("disconnected: " + e.detail.clean);

                // Attempt to reconnect
                setTimeout(connect, 1000);
            }, false);
        }
        connect();
    }, []);

    return (
        <div>
            <NavbarComponent />
            <div id="app" style={{ height: '100vh' }}></div>
        </div>
    )
}

export default VMView;