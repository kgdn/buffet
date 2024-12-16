/*
 * Home.tsx - Home screen and dashboard for the application.
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

import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  ProgressBar,
  Row,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import RFB from "@novnc/novnc/lib/rfb";

import {
  createVirtualMachine,
  deleteVirtualMachine,
  getIsoFiles,
  getRunningVMs,
  getVirtualMachineByUser,
} from "../api/VirtualMachineAPI";
import Footer from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";
import { AuthContext } from "../contexts/AuthContext";

interface Image {
  name: string;
  version: string;
  iso: string;
  desktop: string;
  description: string;
  linux: boolean;
  logo: string;
  homepage: string;
  beginner_friendly: boolean;
  desktop_homepage: string;
  arch: string;
}

interface VmDetails {
  wsport: number;
  id: number;
  name: string;
  version: string;
  desktop: string;
  password: string;
}

/**
 * Home component
 * @param {HomeProps} props - The properties of the component
 * @returns {ReactNode} - The home component
 */
const OperatingSystemListScreen: FC = (): ReactNode => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [linuxImages, setImages] = useState<Image[]>([]);
  const [nonLinuxImages, setNonLinuxImages] = useState<Image[]>([]);
  const [linuxSearchQuery, setSearchQuery] = useState("");
  const [nonLinuxSearchQuery, setNonLinuxSearchQuery] = useState("");
  const [errorModal, showErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [vmCount, setVMCount] = useState(0);
  const [complexIso, setComplexIso] = useState("");
  const [complexityModal, showComplexityModal] = useState(false);
  const [vmDetails, setVmDetails] = useState<VmDetails>({
    wsport: 0,
    id: 0,
    name: "",
    version: "",
    desktop: "",
    password: "",
  });
  const API_URL = import.meta.env.VITE_API_URL.replace(
    /(^\w+:|^)\/\//,
    ""
  );
  const MAX_VM_COUNT = parseInt(import.meta.env.VITE_MAX_VM_COUNT, 10);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Buffet";

    if (user) {
      setUsername(user.username);

      const cachedImages = sessionStorage.getItem("images");
      const cachedNonLinuxImages = sessionStorage.getItem("nonLinuxImages");

      if (cachedImages && cachedNonLinuxImages) {
        setImages(JSON.parse(cachedImages));
        setNonLinuxImages(JSON.parse(cachedNonLinuxImages));
      } else {
        const getImages = async () => {
          const response = await getIsoFiles();
          if (response.status === 200) {
            const linuxImages: Image[] = [];
            const nonLinuxImages: Image[] = [];
            (response.data as Image[]).forEach((image: Image) => {
              if (image.linux) {
                linuxImages.push(image);
              } else {
                nonLinuxImages.push(image);
              }
            });
            setImages(linuxImages);
            setNonLinuxImages(nonLinuxImages);
            sessionStorage.setItem("images", JSON.stringify(linuxImages));
            sessionStorage.setItem("nonLinuxImages", JSON.stringify(nonLinuxImages));
          }
        };
        getImages();
      }

      const getVMCount = async () => {
        const response = await getRunningVMs();
        if (response.status === 200 && response.data) {
          setVMCount(response.data.vm_count);
        }
      };

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
          });
        }
      };

      getVMCount();
      fetchVMDetails();
    }
  }, [user]);

  const createVMButton = (iso: string) => {
    const createVM = async () => {
      const response = await createVirtualMachine(iso);
      if (response.status === 201) {
        navigate("/vm");
      } else {
        showErrorModal(true);
        setErrorMessage(response.message);
      }
    };
    createVM();
  };

  const deleteVMButton = useCallback(() => {
    deleteVirtualMachine(String(vmDetails.id)).then(() => {
      navigate(0);
    });
  }, [vmDetails.id, navigate]);

  const filteredImages = linuxImages.filter(
    (image) =>
      image.name.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
      image.version.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
      image.iso.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
      image.desktop.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
      image.name
        .toLowerCase()
        .concat(" ", image.version.toLowerCase())
        .includes(linuxSearchQuery.toLowerCase()) ||
      image.desktop_homepage
        .toLowerCase()
        .includes(linuxSearchQuery.toLowerCase()) ||
      image.arch.toLowerCase().includes(linuxSearchQuery.toLowerCase())
  );

  const filteredNonLinuxImages = nonLinuxImages.filter(
    (image) =>
      image.name.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
      image.version.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
      image.iso.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
      image.desktop.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
      image.name
        .toLowerCase()
        .concat(" ", image.version.toLowerCase())
        .includes(nonLinuxSearchQuery.toLowerCase()) ||
      image.desktop_homepage
        .toLowerCase()
        .includes(nonLinuxSearchQuery.toLowerCase()) ||
      image.arch.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase())
  );

  const decodedLogo = (logo: string) => {
    return `data:image/png;base64,${logo}`;
  };

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
      rfb.viewOnly = true;
      rfb.scaleViewport = true;
      rfb.resizeSession = true;
    }
  }, [vmDetails.password, vmDetails.wsport, API_URL]);

  useEffect(() => {
    // If the user has a VM running, connect to it
    if (vmDetails.id !== 0) {
      connectToVM();
    }
  }, [vmDetails.id, connectToVM]);

  return (
    <div id="home" style={{ marginTop: "4rem" }}>
      <NavbarComponent />
      <Container>
        <Row>
          <Col id="welcome" className="text-center mt-3">
            <h1>Welcome back, {username}!</h1>
            <p>
              Select a distribution from the list below to create a virtual
              machine.
            </p>
          </Col>
        </Row>
        <Row>
          <Col id="vm-count" className="text-center">
            <Alert variant="info" role="alert">
              <p>
                There {vmCount === 1 ? "is" : "are"} currently {vmCount} virtual {vmCount === 1 ? "machine" : "machines"} running. The
                maximum number of virtual machines that can be run at once is{" "}
                {MAX_VM_COUNT}.
              </p>
              {vmCount === 0 ? (
                <ProgressBar
                  striped
                  animated
                  label
                  variant="success"
                  now={vmCount}
                  max={MAX_VM_COUNT}
                />
              ) : vmCount < MAX_VM_COUNT ? (
                <ProgressBar
                  striped
                  animated
                  label
                  variant="info"
                  now={vmCount}
                  max={MAX_VM_COUNT}
                />
              ) : vmCount === MAX_VM_COUNT ? (
                <ProgressBar
                  striped
                  animated
                  label
                  variant="danger"
                  now={vmCount}
                  max={MAX_VM_COUNT}
                />
              ) : (
                <ProgressBar
                  striped
                  animated
                  label
                  variant="warning"
                  now={vmCount}
                  max={MAX_VM_COUNT}
                />
              )}
            </Alert>
          </Col>
        </Row>
        {/* If user already has a VM running, show a view of the VM */}
        {vmDetails.id !== 0 ? (
          <Row>
            <Col id="current-vm" className="text-center">
              <Alert variant="info" role="alert">
                <h1>Your current virtual machine</h1>
                <p>
                  You currently have a virtual machine running. You can
                  connect to it below.
                </p>
                <div id="app" style={{ width: "100%", height: "500px" }} />
                <ButtonGroup className="d-flex mt-3">
                  <Button variant="primary" href="/vm">
                    View VM
                  </Button>
                  <Button variant="danger" onClick={deleteVMButton}>
                    Shutdown VM
                  </Button>
                </ButtonGroup>
              </Alert>
            </Col>
          </Row>
        ) : (
          <></>
        )}

        <Row>
          <Col>
            <Form className="form-inline">
              <Form.Control
                className="mb-3"
                type="search"
                placeholder="Search by name, desktop, version..."
                aria-label="Search"
                value={linuxSearchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form>
          </Col>
        </Row>
        <Row>
          {filteredImages
            .map((image) => (
              <Col
                key={image.name}
                xs={12}
                md={6}
                lg={4}
                className="d-flex align-items-stretch p-2"
              >
                <Card style={{ height: "100%" }}>
                  <Card.Img
                    variant="top"
                    src={decodedLogo(image.logo)}
                    alt={image.name + " logo"}
                    className="p-3"
                    style={{ height: "200px", objectFit: "contain" }}
                  />
                  <Card.Body>
                    {/* If the operating system is beginner-friendly, show a star icon at the end of the name. On mouse over, show an overlay with the beginner-friendly text. */}
                    {image.beginner_friendly ? (
                      <Card.Title>
                        {image.name} {image.version}{" "}
                        <OverlayTrigger
                          placement="right"
                          overlay={
                            <Tooltip id="tooltip-beginner-friendly">
                              Beginner-friendly
                            </Tooltip>
                          }
                        >
                          <i className="bi bi-star-fill text-warning"></i>
                        </OverlayTrigger>
                      </Card.Title>
                    ) : (
                      <Card.Title>
                        {image.name} {image.version}
                      </Card.Title>
                    )}
                    <Card.Text>{image.desktop}</Card.Text>
                    <Card.Text>{image.description}</Card.Text>
                    <Card.Text>
                      <small className="text-muted">{image.arch}</small>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <ButtonGroup className="d-flex">
                      <Button
                        variant="secondary"
                        href={image.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn More
                      </Button>
                      {image.desktop_homepage ? (
                        <Button
                          variant="info"
                          href={image.desktop_homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Desktop Info
                        </Button>
                      ) : (
                        <></>
                      )}
                      {/* If the operating system is not beginner-friendly, show a warning modal */}
                      {image.beginner_friendly ? (
                        <Button
                          variant="primary"
                          onClick={() => createVMButton(image.iso)}
                        >
                          Create VM
                        </Button>
                      ) : (
                        // pass the iso to the modal so that it can be used in the createVMButton function
                        <Button
                          variant="primary"
                          onClick={() => {
                            showComplexityModal(true);
                            setComplexIso(image.iso);
                          }}
                        >
                          Create VM
                        </Button>
                      )}
                    </ButtonGroup>
                  </Card.Footer>
                </Card>
              </Col>
            ))
            .sort((a, b) =>
              a.key && b.key ? a.key.localeCompare(b.key) : 0
            )}
        </Row>
        {/* If virtual machines with non-Linux operating systems are added, display them here, else do not display this section */}
        {nonLinuxImages.length > 0 ? (
          <>
            <Row>
              <Col id="non-linux" className="text-center mt-3">
                <h1>Non-Linux Operating Systems</h1>
                <p>
                  The following operating systems are not based on the Linux
                  kernel. They were added to Buffet for testing purposes, or
                  share a history with Linux.
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form className="form-inline">
                  <Form.Control
                    className="mb-3"
                    type="search"
                    placeholder="Search by name, desktop, version..."
                    aria-label="Search"
                    value={nonLinuxSearchQuery}
                    onChange={(e) => setNonLinuxSearchQuery(e.target.value)}
                  />
                </Form>
              </Col>
            </Row>
            <Row>
              {filteredNonLinuxImages
                .map((image) => (
                  <Col
                    key={image.name}
                    xs={12}
                    md={6}
                    lg={4}
                    className="d-flex align-items-stretch p-2"
                  >
                    <Card style={{ height: "100%" }}>
                      <Card.Img
                        variant="top"
                        src={decodedLogo(image.logo)}
                        alt={image.name + " logo"}
                        className="p-3"
                        style={{ height: "200px", objectFit: "contain" }}
                      />
                      <Card.Body>
                        {image.beginner_friendly ? (
                          <Card.Title>
                            {image.name} {image.version}{" "}
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id="tooltip-beginner-friendly">
                                  Beginner-friendly
                                </Tooltip>
                              }
                            >
                              <i className="bi bi-star-fill text-warning"></i>
                            </OverlayTrigger>
                          </Card.Title>
                        ) : (
                          <Card.Title>
                            {image.name} {image.version}
                          </Card.Title>
                        )}
                        <Card.Text>{image.desktop}</Card.Text>
                        <Card.Text>{image.description}</Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <ButtonGroup className="d-flex">
                          <Button
                            variant="secondary"
                            href={image.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Learn More
                          </Button>
                          {image.desktop_homepage ? (
                            <Button
                              variant="info"
                              href={image.desktop_homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Desktop Info
                            </Button>
                          ) : (
                            <></>
                          )}
                          {image.beginner_friendly ? (
                            <Button
                              variant="primary"
                              onClick={() => createVMButton(image.iso)}
                            >
                              Create VM
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              onClick={() => {
                                showComplexityModal(true);
                                setComplexIso(image.iso);
                              }}
                            >
                              Create VM
                            </Button>
                          )}
                        </ButtonGroup>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))
                .sort((a, b) =>
                  a.key && b.key ? a.key.localeCompare(b.key) : 0
                )}
            </Row>
          </>
        ) : (
          <></>
        )}
      </Container>
      <Modal show={errorModal} onHide={() => showErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unable to provision VM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Something seems to have gone wrong. You can see the error message
            below.
          </p>
          <Alert variant="danger" role="alert">
            {errorMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button variant="secondary" onClick={() => showErrorModal(false)}>
              Close
            </Button>
            {/* If the error message is anything but "Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one.", do not show a button to view the user's VMs */}
            {errorMessage ===
              "Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one." ? (
              <ButtonGroup>
                <Button variant="primary" href="/vm">
                  View VM
                </Button>
                <Button variant="danger" onClick={deleteVMButton}>
                  Shutdown VM
                </Button>
              </ButtonGroup>
            ) : (
              <></>
            )}
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
      {/* Show modal warning the user if the ISO they've chosen is not beginner-friendly */}
      <Modal show={complexityModal} onHide={() => showComplexityModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This distribution has been marked as not beginner-friendly. This
            means that it may be more difficult to use than other distributions.
          </p>

          <p>
            Are you sure you want to continue? If you are new to Linux, it is
            recommended that you choose a beginner-friendly distribution marked
            with a star.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => showComplexityModal(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                createVMButton(complexIso);
                showComplexityModal(false);
              }}
            >
              Create VM
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
      <Footer />
    </div>
  );
};

export default OperatingSystemListScreen;