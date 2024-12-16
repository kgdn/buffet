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

import { FC, ReactElement, useCallback, useEffect, useState } from "react";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import Draggable from "react-draggable";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import RFB from "@novnc/novnc/lib/rfb";

import {
  deleteVirtualMachine,
  getVirtualMachineByUser,
} from "../api/VirtualMachineAPI";

interface VmDetails {
  wsport: number;
  id: number;
  name: string;
  version: string;
  desktop: string;
  password: string;
  homepage: string;
  desktop_homepage: string;
}

const VirtualMachineViewScreen: FC = (): ReactElement => {
  const cookies = new Cookies(null, { path: "/" });
  const [vmDetails, setVmDetails] = useState<VmDetails>({
    wsport: 0,
    id: 0,
    name: "",
    version: "",
    desktop: "",
    password: "",
    homepage: "",
    desktop_homepage: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL.replace(
    /(^\w+:|^)\/\//,
    ""
  );
  const navigate = useNavigate();

  // Fetches the virtual machine details from the database
  useEffect(() => {
    const fetchVMDetails = async () => {
      const response = await getVirtualMachineByUser();
      const data = response.data;
      if (data) {
        setVmDetails({
          wsport: data.wsport,
          id: data.id,
          name: data.name,
          version: data.version,
          desktop: data.desktop,
          password: data.vnc_password,
          homepage: data.homepage,
          desktop_homepage: data.desktop_homepage,
        });
      }
    };
    fetchVMDetails();
  }, []);

  // Sets the document title to the virtual machine name, version, and desktop, and handles keydown events
  useEffect(() => {
    document.title = `${vmDetails.name} ${vmDetails.version} ${vmDetails.desktop} - Buffet`;

    window.addEventListener("keydown", handleKeyDown);
  });

  // Check for the cookie and conditionally open the modal
  useEffect(() => {
    const modalCookie = cookies.get("modalShown");
    if (!modalCookie && vmDetails.wsport !== 0) {
      setIsModalOpen(true);
      cookies.set("modalShown", "true", { path: "/" });
    }
  }, [vmDetails.wsport]);

  // Function to manually open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Deletes the virtual machine from the database and navigates to the home page
  const deleteVM = useCallback(() => {
    deleteVirtualMachine(String(vmDetails.id)).then(() => {
      navigate("/os");
    });
  }, [vmDetails.id, navigate]);

  // Handles the keydown event. If the key is F11, it toggles fullscreen mode.
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "F11") {
      event.preventDefault();
      handleFullscreen();
    }
  }, []);

  // Toggles fullscreen mode. If the document is currently in fullscreen mode, it exits fullscreen mode. Otherwise, it enters fullscreen mode.
  const handleFullscreen = () => {
    const elem = document.getElementById("app");
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      elem?.requestFullscreen();
    }
  };

  // Connect to the virtual machine using noVNC when the wsport is set
  const connectToVM = useCallback(() => {
    const appElement = document.getElementById("app");
    if (appElement) {
      const protocol = import.meta.env.DEV || !import.meta.env.VITE_SSL_ENABLED ? "ws" : "wss";
      const rfb = new RFB(
        appElement,
        `${protocol}://${import.meta.env.DEV ? 'localhost:5700' : `${API_URL}/websockify/${vmDetails.wsport}/`}`,
        {
          credentials: {
            username: "",
            password: vmDetails.password,
            target: "",
          },
        }
      );

      rfb.scaleViewport = true;
      rfb.resizeSession = true;
      rfb.focusOnClick = true;
      rfb.clipViewport = true;

      // When the connection is established, focus on the virtual machine
      rfb.addEventListener("connect", () => {
        rfb.focus();
      });

      rfb.addEventListener("disconnect", () => {
        navigate("/os");
      });
    }
  }, [API_URL, vmDetails.password, vmDetails.wsport]);

  // Connect to the virtual machine when the wsport is set
  useEffect(() => {
    if (vmDetails.wsport !== 0) {
      const timeout = setTimeout(connectToVM, 250);
      return () => clearTimeout(timeout);
    }
  }, [connectToVM, vmDetails.wsport]);

  return (
    <div id="virtual-machine-view">
      <div
        id="app"
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      <Draggable bounds="#app">
        <ButtonGroup
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 100,
            margin: "10px",
          }}
        >
          <Button
            variant="light"
            href={vmDetails.homepage}
            target="_blank"
            rel="noreferrer"
          >
            {vmDetails.name} {vmDetails.version}
          </Button>
          <Button
            variant="secondary"
            href={vmDetails.desktop_homepage}
            target="_blank"
            rel="noreferrer"
          >
            {vmDetails.desktop}
          </Button>
          <Button disabled variant="dark">
            :: Buffet ::
          </Button>
        </ButtonGroup>
      </Draggable>

      <Draggable bounds="#app">
        <ButtonGroup
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 100,
            margin: "10px",
          }}
        >
          <Button disabled variant="dark">
            :: Buffet ::
          </Button>
          <Button variant="primary" href="/os">
            Home
          </Button>
          <Button variant="info" onClick={() => handleOpenModal()}>
            Information
          </Button>
          <Button variant="warning" onClick={handleFullscreen}>
            Fullscreen
          </Button>
          <Button variant="danger" onClick={deleteVM}>
            Shutdown
          </Button>
        </ButtonGroup>
      </Draggable>

      {/* Information modal */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>For Your Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Buffet is currently in development. Some features may not work as
            expected. If you find a bug, please report it on GitHub.
          </p>
          <p>
            Due to technical limitations, you need to click the viewer to
            interact with the virtual machine.
          </p>
          <p>
            <strong>Please note:</strong> All internet traffic is logged, and
            can be viewed by the system administrator. Any misuse of the system
            will result in your account being terminated.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button
              variant="secondary"
              href="https://github.com/kgdn/buffet/issues/new"
              target="_blank"
              rel="noreferrer"
            >
              Report Bug
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VirtualMachineViewScreen;
