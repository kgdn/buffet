import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AccountsAPI from '../api/AccountsAPI';
import NavbarComponent from '../components/Navbar';
import { Container, Row, Col } from 'react-bootstrap';
import Footer from '../components/Footer';

function VerifyUser() {
    const { id } = useParams();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { message } = await AccountsAPI.verifyRegistration(id);
                setMessage(message);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [id]);

    return (
        <div>
            <NavbarComponent />
            <Container>
                <Row>
                    <Col className='mb-3'>
                        <h1>Verify User</h1>
                        <p>{message}</p>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
}

export default VerifyUser;