import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

function Footer() {
    return (
        <div className='footer'>
            <Container>
                <Row>
                    <Col className='text-center'>
                        <hr />
                        <Col className='py-3'>
                            <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">
                                <Image src='https://www.gnu.org/graphics/agplv3-with-text-162x68.png' alt='GNU Affero General Public License v3.0' />
                            </a>
                        </Col>
                        <p className='mb-0' style={{ marginLeft: '10px' }}>&copy; {new Date().getFullYear()} Kieran Gordon &middot; Licensed under the <a href='https://www.gnu.org/licenses/agpl-3.0.en.html'>GNU Affero General Public License v3.0</a>.</p>
                        <p>Developed as part of a dissertation for <a href='https://www.hw.ac.uk/uk/schools/mathematical-computer-sciences.htm'>Heriot-Watt University&apos;s School of Mathematical and Computer Sciences</a>.</p>
                        <p>Logos courtesy of <a href='https://commons.wikimedia.org/wiki/Main_Page'>Wikimedia Commons</a>. Respective owners retain all rights, unless otherwise stated.</p>
                    </Col>
                </Row>
            </Container >
        </div >
    );
}

export default Footer;