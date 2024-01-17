import React from "react";
import NavbarComponent from "../components/Navbar";
import Footer from "../components/Footer";
import { Container } from "react-bootstrap";

function AboutHelp() {
    return (
        <div>
            <NavbarComponent />
            <Container>
                <h1>About</h1>
            </Container>
            <Footer />
        </div>
    );
}

export default AboutHelp;