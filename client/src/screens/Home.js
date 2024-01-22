import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal, Alert, Carousel, ButtonGroup, ProgressBar } from 'react-bootstrap';
import NavbarComponent from '../components/Navbar';
import AccountsAPI from '../api/AccountsAPI';
import VirtualMachineAPI from '../api/VirtualMachineAPI';
import Footer from '../components/Footer';
import fedora from '../assets/carousel/fedora.png'
import ubuntu from '../assets/carousel/ubuntu.png'
import opensuse from '../assets/carousel/opensuse.png'

function Home() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [iso, setImages] = useState([]);
    const [nonLinuxImages, setNonLinuxImages] = useState([]);
    const [linuxSearchQuery, setSearchQuery] = useState('');
    const [nonLinuxSearchQuery, setNonLinuxSearchQuery] = useState('');
    const [errorModal, showErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [username, setUsername] = useState('');
    const [vmCount, setVMCount] = useState(0);

    useEffect(() => {

        document.title = 'Buffet';

        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setLoggedIn(true);
                setUsername(response.data.username);
                VirtualMachineAPI.getIsoFiles().then((response) => {
                    if (response.status === 200) {
                        response.data.forEach((image) => {
                            if (image.linux) {
                                setImages((iso) => [...iso, image]);
                            } else {
                                setNonLinuxImages((nonLinuxImages) => [...nonLinuxImages, image]);
                            }
                        });
                    }
                });
                VirtualMachineAPI.getVirtualMachineByUser(response.data.id).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/vm/';
                    }
                });
                VirtualMachineAPI.getRunningVMs().then((response) => {
                    if (response.status === 200) {
                        setVMCount(response.data.vm_count);
                    }
                }
                );
            }
        });
    }, []);

    const createVMButton = (iso) => {
        const createVM = async () => {
            const response = await VirtualMachineAPI.createVirtualMachine(iso);
            if (response.status === 201) {
                window.location.href = '/vm/';
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
        image.description.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
        image.desktop.toLowerCase().includes(linuxSearchQuery.toLowerCase()) ||
        image.name.toLowerCase().concat(' ', image.version.toLowerCase()).includes(linuxSearchQuery.toLowerCase())
    );

    const filteredNonLinuxImages = nonLinuxImages.filter((image) =>
        image.name.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.version.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.iso.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.desktop.toLowerCase().includes(nonLinuxSearchQuery.toLowerCase()) ||
        image.name.toLowerCase().concat(' ', image.version.toLowerCase()).includes(nonLinuxSearchQuery.toLowerCase())
    );

    const decodedLogo = (logo) => {
        return `data:image/png;base64,${logo}`;
    }

    return (
        <div>
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
                                {/* Change the progress bar colour depending on the number of VMs running */}
                                {vmCount === 0 ? (
                                    <ProgressBar variant="success" now={vmCount} max={5} />
                                ) : vmCount > 2 ? (
                                    <ProgressBar variant="warning" now={vmCount} max={5} />
                                ) : vmCount > 3 ? (
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
                                <Form.Control className="mb-3" type="search" placeholder="Search" aria-label="Search" value={linuxSearchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        {filteredImages.map((image) => (
                            <Col key={image.id} xs={12} md={6} lg={4} style={{ paddingBottom: '1rem' }}>
                                <Card style={{ height: '100%' }}>
                                    <Card.Img variant="top" src={decodedLogo(image.logo)} className="p-3" style={{ height: '200px', objectFit: 'contain', backgroundColor: '#f8f8f8' }} />
                                    <Card.Body>
                                        <Card.Title>{image.name} {image.version}</Card.Title>
                                        <Card.Text>{image.desktop}</Card.Text>
                                        <Card.Text>{image.description}</Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <ButtonGroup className="d-flex">
                                            <Button variant="primary" onClick={() => createVMButton(image.iso)}>Create VM</Button>
                                            <Button variant="secondary" href={image.homepage} target="_blank" rel="noopener noreferrer">Learn More</Button>
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
                                        <Form.Control className="mb-3" type="search" placeholder="Search" aria-label="Search" value={nonLinuxSearchQuery} onChange={(e) => setNonLinuxSearchQuery(e.target.value)} />
                                    </Form>
                                </Col>
                            </Row>
                            <Row>
                                {filteredNonLinuxImages.map((image) => (
                                    <Col key={image.id} xs={12} md={6} lg={4} style={{ paddingBottom: '1rem' }}>
                                        <Card style={{ height: '100%' }}>
                                            <Card.Img variant="top" src={decodedLogo(image.logo)} className="p-3" style={{ height: '200px', objectFit: 'contain', backgroundColor: '#f8f8f8' }} />
                                            <Card.Body>
                                                <Card.Title>{image.name} {image.version}</Card.Title>
                                                <Card.Text>{image.desktop}</Card.Text>
                                                <Card.Text>{image.description}</Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <ButtonGroup className="d-flex">
                                                    <Button variant="primary" onClick={() => createVMButton(image.iso)}>Create VM</Button>
                                                    <Button variant="secondary" href={image.homepage} target="_blank" rel="noopener noreferrer">Learn More</Button>
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
                            <h1 className="display-4 text-center">Welcome to Buffet</h1>
                            <h3 className="text-center">Buffet is a web-based virtual machine manager that allows you to try various GNU/Linux distributions, all within your browser.</h3>
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
                                    <Carousel.Caption style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                                    <Carousel.Caption style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                                    <Carousel.Caption style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                        <h3>openSUSE</h3>
                                        <p>openSUSE is a Linux distribution sponsored by SUSE Software Solutions Germany GmbH and other companies.</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            </Carousel>
                            <h4>Including Fedora, Ubuntu and openSUSE, and many more!</h4>
                            <p>All screenshots were taken from virtual machines running on Buffet.</p>
                        </Col>
                        <Col id="how-it-works">
                            <h1>How does Buffet work?</h1>
                            <p>Buffet uses <a href="https://www.qemu.org/">QEMU</a>/<a href="https://linux-kvm.org/page/Main_Page">KVM</a> to run its virtual machines. The virtual machines are run on a server, and you connect to them via a web browser through <a href="https://novnc.com/">noVNC</a>. This means that you can run virtual machines on any device with a web browser, including mobile phones and tablets.</p>
                            <p>The website you are currently viewing is the front-end of Buffet, written in <a href="https://reactjs.org/">React</a>. The back-end is written in <a href="https://www.python.org/">Python</a> using the <a href="https://flask.palletsprojects.com/en/3.0.x/">Flask</a> framework. The source code for Buffet is available on <a href="https://github.com/kgdn/buffet">GitHub</a>.</p>
                            <p>Buffet is licensed under the <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU General Public License v3.0</a>. This means that you are free to use, modify and distribute Buffet as you wish, as long as you make your modifications available under the same license.</p>
                            <p><strong>Note:</strong> Buffet is currently in heavy development. You may experience bugs. Please report any bugs you find on <a href="https://github.com/kgdn/buffet/issues">GitHub</a>.</p>
                        </Col>
                    </Row>
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
                    <Button variant="secondary" onClick={() => showErrorModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Footer />
        </div>
    );
}

export default Home;
