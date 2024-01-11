import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
    return (
        <div className='footer'>
            <Container>
                <Row>
                    <Col className='text-center py-3'>
                        <p>Buffet is an open source student project by <a href='https://kgdn.xyz'>Kieran Gordon</a> and is not affiliated with Heriot-Watt University.</p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Footer;