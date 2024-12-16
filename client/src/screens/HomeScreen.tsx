import { FC, ReactElement } from "react";
import { Button, ButtonGroup, Carousel, Col, Container, Row } from "react-bootstrap";
import NavbarComponent from "../components/NavbarComponent";
import fedora from "../assets/carousel/fedora.png";
import ubuntu from "../assets/carousel/ubuntu.png";
import opensuse from "../assets/carousel/opensuse.png";
import Footer from "../components/FooterComponent";

const HomeScreen: FC = (): ReactElement => {
    return (
        <div id="home-screen" style={{ marginTop: "4rem" }}>
            <NavbarComponent />
            <Container>
                <Row className="mt-3 mb-3" id="welcome">
                    <Col id="about" className="text-center mt-3">
                        <h1 className="display-4 text-center">Welcome to Buffet.</h1>
                        <h3 className="text-center">
                            The all-you-can-eat GNU/Linux buffet.
                        </h3>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6} className="text-center" id="desktop-carousel">
                        <Carousel
                            style={{
                                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
                                borderRadius: "10px",
                                overflow: "hidden",
                                margin: "10px",
                            }}
                        >
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={fedora}
                                    alt="Fedora Linux"
                                />
                                <Carousel.Caption
                                    style={{
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        color: "white",
                                    }}
                                >
                                    <h3>Fedora</h3>
                                    <p>
                                        Fedora is a Linux distribution developed by the Fedora
                                        Project which is sponsored by Red Hat.
                                    </p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={ubuntu}
                                    alt="Ubuntu Linux"
                                />
                                <Carousel.Caption
                                    style={{
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        color: "white",
                                    }}
                                >
                                    <h3>Ubuntu</h3>
                                    <p>
                                        Ubuntu is a Linux distribution based on Debian. It is
                                        developed by Canonical and the Ubuntu community.
                                    </p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={opensuse}
                                    alt="openSUSE Linux"
                                />
                                <Carousel.Caption
                                    style={{
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        color: "white",
                                    }}
                                >
                                    <h3>openSUSE</h3>
                                    <p>
                                        openSUSE is a Linux distribution sponsored by SUSE
                                        Software Solutions Germany GmbH and other companies.
                                    </p>
                                </Carousel.Caption>
                            </Carousel.Item>
                        </Carousel>
                        <h4>Including Fedora, Ubuntu and openSUSE, and more!</h4>
                        <p>
                            All screenshots were taken from virtual machines running on
                            Buffet.
                        </p>
                    </Col>
                    <Col xs={12} md={6} id="what-is-buffet">
                        <p>
                            Buffet is a web-based virtual machine manager that allows you to
                            try various GNU/Linux distributions, all from within your
                            browser.
                        </p>
                        <p>
                            Simply choose an operating system from the list, and Buffet will
                            create a virtual machine for you. You can then connect to the
                            virtual machine via a web browser, and use it as if it were
                            installed on your computer.
                        </p>
                        <p>
                            When you are finished with the virtual machine, you can delete
                            it, and Buffet will remove all traces of it from the server.
                            This means that you can try as many operating systems as you
                            like, without having to worry about the complexities of the
                            installation process, or the security implications of running a
                            virtual machine on your computer.
                        </p>
                        <p>
                            What&apos;s more, Buffet is completely free to use, and always
                            will be. In the spirit of free and open-source software, Buffet
                            is free as in freedom, and free as in beer.
                        </p>
                        <ButtonGroup className="d-flex">
                            <Button variant="primary" href="/login">
                                Get Started
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
}

export default HomeScreen;