/*
* Home.js - Home screen and dashboard for the application.
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

import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal, Alert, Carousel, ButtonGroup, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';
import NavbarComponent from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import VirtualMachineAPI from '../api/VirtualMachineAPI';
import Footer from '../components/Footer';
import fedora from '../assets/carousel/fedora.png'
import ubuntu from '../assets/carousel/ubuntu.png'
import opensuse from '../assets/carousel/opensuse.png'

function Home() {
    const { user } = useContext(AuthContext);
    const [loggedIn, setLoggedIn] = useState(false);
    const [iso, setImages] = useState([]);
    const [nonLinuxImages, setNonLinuxImages] = useState([]);
    const [linuxSearchQuery, setSearchQuery] = useState('');
    const [nonLinuxSearchQuery, setNonLinuxSearchQuery] = useState('');
    const [errorModal, showErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [username, setUsername] = useState('');
    const [vmCount, setVMCount] = useState(0);
    const [complexIso, setComplexIso] = useState('');
    const [complexityModal, showComplexityModal] = useState(false);

    useEffect(() => {
        document.title = 'Buffet';

        if (user) {
            setLoggedIn(true);
            setUsername(user.username);

            const getImages = async () => {
                const response = await VirtualMachineAPI.getIsoFiles();
                if (response.status === 200) {
                    const linuxImages = [];
                    const nonLinuxImages = [];
                    response.data.forEach((image) => {
                        if (image.linux) {
                            linuxImages.push(image);
                        } else {
                            nonLinuxImages.push(image);
                        }
                    });
                    setImages(linuxImages);
                    setNonLinuxImages(nonLinuxImages);
                }
            };

            const getVMCount = async () => {
                const response = await VirtualMachineAPI.getRunningVMs();
                if (response.status === 200) {
                    setVMCount(response.data.vm_count);
                }
            };

            getImages();
            getVMCount();
        }
    }, [user]);


    const createVMButton = (iso) => {
        const createVM = async () => {
            const response = await VirtualMachineAPI.createVirtualMachine(iso);
            if (response.status === 201) {
                window.location.href = '/vm';
            } else {
                showErrorModal(true);
                setErrorMessage(response.message);
            }
        };
        createVM();
    };

    const filteredImages = iso.filter((image) =>
        image.name.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
        image.version.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
        image.iso.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
        image.desktop.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
        image.name.toLowerCase().concat(' ', image.version.toLowerCase()).includes(linuxSearchQuery.toLowerCase())
    );

    const filteredNonLinuxImages = nonLinuxImages.filter((image) =>
        image.name.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.version.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.iso.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.desktop.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.name.toLowerCase().concat(' ', image.version.toLowerCase()).includes(nonLinuxSearchQuery.toLowerCase())
    );

    const decodedLogo = (logo) => {
        return `data:image/png;base64,${logo}`;
    }

    return (
        <div id="home">
            <NavbarComponent />
            {loggedIn ? (
                <Container>
                    <Row>
                        <Col id="welcome" className="text-center" style={{ paddingTop: '1rem' }}>
                            <h1>Welcome back, {username}!</h1>
                            <p>Choose an operating system to get started.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col id="vm-count" className="text-center" style={{ paddingTop: '1rem' }}>
                            <Alert variant="info" role="alert">
                                <p>There are currently {vmCount} virtual machines running. The maximum number of virtual machines that can be run at once is 5.</p>
                                {vmCount === 0 ? (
                                    <ProgressBar variant="success" now={vmCount} max={5} />
                                ) : vmCount > 2 && vmCount < 5 ? (
                                    <ProgressBar variant="warning" now={vmCount} max={5} />
                                ) : vmCount === 5 ? (
                                    <ProgressBar variant="danger" now={vmCount} max={5} />
                                ) : (
                                    <ProgressBar variant="info" now={vmCount} max={5} />
                                )}
                            </Alert>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form className="form-inline">
                                <Form.Control className="mb-3" type="search" placeholder="Search by name, desktop, version..." aria-label="Search" value={linuxSearchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        {filteredImages.map((image) => (
                            <Col key={image.name} xs={12} md={6} lg={4} className="d-flex align-items-stretch p-2">
                                <Card style={{ height: '100%' }}>
                                    <Card.Img variant="top" src={decodedLogo(image.logo)} alt={image.name + ' logo'} className="p-3" style={{ height: '200px', objectFit: 'contain' }} />
                                    <Card.Body>
                                        {/* If the operating system is beginner-friendly, show a star icon at the end of the name. On mouse over, show an overlay with the beginner-friendly text. */}
                                        {image.beginner_friendly ? (
                                            <Card.Title>{image.name} {image.version} <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-beginner-friendly">Beginner-friendly</Tooltip>}><i className="bi bi-star-fill text-warning"></i></OverlayTrigger></Card.Title>
                                        ) : (
                                            <Card.Title>{image.name} {image.version}</Card.Title>
                                        )}
                                        <Card.Text>{image.desktop}</Card.Text>
                                        <Card.Text>{image.description}</Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <ButtonGroup className="d-flex">
                                            <Button variant="secondary" href={image.homepage} target="_blank" rel="noopener noreferrer">Learn More</Button>
                                            {/* If the operating system is not beginner-friendly, show a warning modal */}
                                            {image.beginner_friendly ? (
                                                <Button variant="primary" onClick={() => createVMButton(image.iso)}>Create VM</Button>
                                            ) : (
                                                // pass the iso to the modal so that it can be used in the createVMButton function
                                                <Button variant="primary" onClick={() => { showComplexityModal(true); setComplexIso(image.iso); }}>Create VM</Button>
                                            )}
                                        </ButtonGroup>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )).sort((a, b) => a.key.localeCompare(b.key))}
                    </Row>
                    {/* If virtual machines with non-Linux operating systems are added, display them here, else do not display this section */}
                    {nonLinuxImages.length > 0 ? (
                        <>
                            <Row>
                                <Col id="non-linux" className="text-center" style={{ paddingTop: '1rem' }}>
                                    <h1>Non-Linux Operating Systems</h1>
                                    <p>The following operating systems are not based on the Linux kernel. They were added to Buffet for testing purposes, or share a history with Linux.</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form className="form-inline">
                                        <Form.Control className="mb-3" type="search" placeholder="Search by name, desktop, version..." aria-label="Search" value={nonLinuxSearchQuery} onChange={(e) => setNonLinuxSearchQuery(e.target.value)} />
                                    </Form>
                                </Col>
                            </Row>
                            <Row>
                                {filteredNonLinuxImages.map((image) => (
                                    <Col key={image.name} xs={12} md={6} lg={4} className="d-flex align-items-stretch p-2">
                                        <Card style={{ height: '100%' }}>
                                            <Card.Img variant="top" src={decodedLogo(image.logo)} alt={image.name + ' logo'} className="p-3" style={{ height: '200px', objectFit: 'contain' }} />
                                            <Card.Body>
                                                {image.beginner_friendly ? (
                                                    <Card.Title>{image.name} {image.version} <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-beginner-friendly">Beginner-friendly</Tooltip>}><i className="bi bi-star-fill text-warning"></i></OverlayTrigger></Card.Title>
                                                ) : (
                                                    <Card.Title>{image.name} {image.version}</Card.Title>
                                                )}
                                                <Card.Text>{image.desktop}</Card.Text>
                                                <Card.Text>{image.description}</Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <ButtonGroup className="d-flex">
                                                    <Button variant="secondary" href={image.homepage} target="_blank" rel="noopener noreferrer">Learn More</Button>
                                                    {image.beginner_friendly ? (
                                                        <Button variant="primary" onClick={() => createVMButton(image.iso)}>Create VM</Button>
                                                    ) : (
                                                        <Button variant="primary" onClick={() => { showComplexityModal(true); setComplexIso(image.iso); }}>Create VM</Button>
                                                    )}
                                                </ButtonGroup>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                )).sort((a, b) => a.key.localeCompare(b.key))}
                            </Row>
                        </>
                    ) : (
                        <></>
                    )}
                </Container>
            ) : (
                <Container>
                    <Row style={{ paddingBottom: '1rem' }}>
                        <Col id="about" className="text-center" style={{ paddingBottom: '1rem' }}>
                            <h1 className="display-4 text-center">Welcome to Buffet.</h1>
                            <h3 className="text-center">The all-you-can-eat GNU/Linux buffet.</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col id="desktop-carousel" className="text-center">
                            <Carousel style={{ boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)', borderRadius: '10px', overflow: 'hidden', margin: '10px' }}>
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100"
                                        src={fedora}
                                        alt="Fedora Linux"
                                    />
                                    <Carousel.Caption style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                        <h3>Fedora</h3>
                                        <p>Fedora is a Linux distribution developed by the Fedora Project which is sponsored by Red Hat.</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100"
                                        src={ubuntu}
                                        alt="Ubuntu Linux"
                                    />
                                    <Carousel.Caption style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                        <h3>Ubuntu</h3>
                                        <p>Ubuntu is a Linux distribution based on Debian. It is developed by Canonical and the Ubuntu community.</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100"
                                        src={opensuse}
                                        alt="openSUSE Linux"
                                    />
                                    <Carousel.Caption style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                        <h3>openSUSE</h3>
                                        <p>openSUSE is a Linux distribution sponsored by SUSE Software Solutions Germany GmbH and other companies.</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            </Carousel>
                            <h4>Including Fedora, Ubuntu and openSUSE, and more!</h4>
                            <p>All screenshots were taken from virtual machines running on Buffet.</p>
                        </Col>
                        <Col id="what-is-buffet">
                            <p>Buffet is a web-based virtual machine manager that allows you to try various GNU/Linux distributions, all from within your browser.</p>
                            <p>Simply choose an operating system from the list, and Buffet will create a virtual machine for you. You can then connect to the virtual machine via a web browser, and use it as if it were installed on your computer.</p>
                            <p>When you are finished with the virtual machine, you can delete it, and Buffet will remove all traces of it from the server. This means that you can try as many operating systems as you like, without having to worry about the complexities of the installation process, or the security implications of running a virtual machine on your computer.</p>
                            <p>What&apos;s more, Buffet is completely free to use, and always will be. In the spirit of free and open-source software, Buffet is free as in freedom, and free as in beer.</p>
                            <ButtonGroup className="d-flex">
                                <Button variant="primary" href="/login">Get Started</Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Col id="how-it-works">
                        <h1 className="text-center">How does Buffet work?</h1>
                        <p>Buffet uses <a href="https://www.qemu.org/">QEMU</a>/<a href="https://linux-kvm.org/page/Main_Page">KVM</a> to run its virtual machines. The virtual machines are run on a server, and you connect to them via a web browser through <a href="https://novnc.com/">noVNC</a>. This means that you can run virtual machines on any device with a web browser, including mobile phones and tablets.</p>
                        <p>The website you are currently viewing is the front-end of Buffet, written in <a href="https://reactjs.org/">React</a>. The back-end is written in <a href="https://www.python.org/">Python</a> using the <a href="https://flask.palletsprojects.com/en/3.0.x/">Flask</a> framework. The source code for Buffet is available on <a href="https://github.com/kgdn/buffet">GitHub</a>.</p>
                        <p>Buffet is licensed under the <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">GNU Affero General Public License v3.0</a>. This means that you are free to use, modify and distribute Buffet as you wish, as long as you make your modifications available under the same license. Network use of Buffet is also permitted, as long as you make the source code available to the users of the network.</p>
                        <p><strong>Note:</strong> Buffet is currently in heavy development. You may experience bugs. Please report any bugs you find on <a href="https://github.com/kgdn/buffet/issues">GitHub</a>.</p>
                        <p><strong>For the best experience, use the latest version of Google Chrome, or another Chromium-based browser.</strong></p>
                    </Col>
                </Container>
            )}
            <Modal show={errorModal} onHide={() => showErrorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Unable to provision VM</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Something seems to have gone wrong. You can see the error message below.</p>
                    <Alert variant="primary" role="alert">
                        {errorMessage}
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="secondary" onClick={() => showErrorModal(false)}>
                            Close
                        </Button>
                        {/* If the error message is anything but "Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one.", do not show a button to view the user's VMs */}
                        {errorMessage === "Users may only have one virtual machine at a time. Please shut down your current virtual machine before creating a new one." ? (
                            <Button variant="primary" href="/vm/">
                                View VMs
                            </Button>
                        ) : (
                            <></>
                        )}
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
            {/* Show modal warning the user if the ISO they've chosen is not beginner-friendly */}
            <Modal show={complexityModal} onHide={() => showComplexityModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>This distribution has been marked as not beginner-friendly. This means that it may be more difficult to use than other distributions.</p>

                    <p>Are you sure you want to continue? If you are new to Linux, it is recommended that you choose a beginner-friendly distribution marked with a star.</p>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="secondary" onClick={() => showComplexityModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => { createVMButton(complexIso); showComplexityModal(false); }}>
                            Create VM
                        </Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
            <Footer />
        </div>
    );
}

export default Home;
