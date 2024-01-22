import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

function Footer() {
    return (
        <div>
            <Container>
                <Row>
                    <Col className='text-center'>
                        <Col className='py-3'>
                            <a href='https://www.hw.ac.uk'>
                                <Image src='https://www.hw.ac.uk/img/hw-logo.svg' alt='Heriot-Watt University logo' style={{ width: '120px', marginRight: '10px' }} />
                            </a>
                            <a href='https://www.gnu.org/licenses/gpl-3.0.en.html'>
                                <Image src='https://www.gnu.org/graphics/gplv3-127x51.png' alt='GNU General Public License v3.0' style={{ width: '120px', marginLeft: '10px' }} />
                            </a>
                        </Col>
                        <p className='mb-0' style={{ marginLeft: '10px' }}>Buffet is a project by <a href='https://kgdn.xyz'>Kieran Gordon</a>, developed as part of a dissertation for <a href='https://www.hw.ac.uk/uk/schools/mathematical-computer-sciences.htm'>Heriot-Watt University&apos;s School of Mathematical and Computer Sciences</a>.</p>
                    </Col>
                </Row>
            </Container>
        </div >
    );
}

export default Footer;