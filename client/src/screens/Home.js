import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal, Alert } from 'react-bootstrap';
import NavbarComponent from '../components/Navbar';
import AccountsAPI from '../api/AccountsAPI';
import VirtualMachineAPI from '../api/VirtualMachineAPI';
import Footer from '../components/Footer';

function Home() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [images, setImages] = useState([]);
    const [nonLinuxImages, setNonLinuxImages] = useState([]);
    const [linuxSearchQuery, setSearchQuery] = useState('');
    const [nonLinuxSearchQuery, setNonLinuxSearchQuery] = useState('');
    const [errorModal, showErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        document.title = 'Buffet - Home';
    }, []);

    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setLoggedIn(true);
                VirtualMachineAPI.getAllImages().then((response) => {
                    if (response.status === 200) {
                        response.data.forEach((image) => {
                            if (image.linux) {
                                setImages((images) => [...images, image]);
                            } else {
                                setNonLinuxImages((nonLinuxImages) => [...nonLinuxImages, image]);
                            }
                        });
                    }
                });
            }
        });
    }, []);

    const CreateVMButton = (iso) => {
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

    const filteredImages = images.filter((image) =>
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

    return (
        <div>
            <NavbarComponent />
            <Container>
                <Row>
                    <Col id="about">
                        <h1 className="display-4">Welcome to Buffet</h1>
                        <h3>Buffet is a web-based virtual machine manager that allows you to try various GNU/Linux distributions, and some non-Linux operating systems, all within your browser.</h3>
                        <p>Buffet is currently in development.</p>
                    </Col>
                </Row>
            </Container>

            {loggedIn ? (
                <Container>
                    <Row>
                        <Col id="about">
                            <h1>Operating Systems</h1>
                            <p>Choose an operating system to get started.</p>
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
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{image.name} {image.version}</Card.Title>
                                        <Card.Text>{image.desktop}</Card.Text>
                                        <Card.Text>{image.description}</Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="primary" onClick={() => CreateVMButton(image.iso)}>Create VM</Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )).sort((a, b) => a.key.localeCompare(b.key))}
                    </Row>
                    {/* If virtual machines with non-Linux operating systems are added, display them here, else do not display this section */}
                    {nonLinuxImages.length > 0 ? (
                        <>
                            <Row>
                                <Col id="about">
                                    <h1>Non-Linux Operating Systems</h1>
                                    <p>The operating systems below are not based on the Linux kernel. They are included for testing purposes.</p>
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
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>{image.name} {image.version}</Card.Title>
                                                <Card.Text>{image.desktop}</Card.Text>
                                                <Card.Text>{image.description}</Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <Button variant="primary" onClick={() => CreateVMButton(image.iso)}>Create VM</Button>
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
                    <Row>
                        <Col>
                            <p>You can create an account or login <a href="/login">here</a>.</p>
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
