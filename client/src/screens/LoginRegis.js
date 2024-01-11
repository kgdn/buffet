import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Form, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';
import validator from 'validator';
import passwordValidator from 'password-validator';
import Footer from '../components/Footer';

function LoginRegis() {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        document.title = 'Buffet - Login/Register';
    }, []);

    const LoginButton = () => {
        if (loginUsername.trim() === '' || loginPassword.trim() === '') {
            setMessage('Username and password cannot be empty.');
            return;
        }
        AccountsAPI.login(loginUsername, loginPassword).then((response) => {
            if (response.status === 200) {
                // navigate to home page
                window.location.href = '/';
            } else {
                setMessage(response.message);
            }
        });
    };

    const RegisterButton = () => {
        if (registerUsername.trim() === '' || registerEmail.trim() === '' || registerPassword.trim() === '') {
            setMessage('Username, email, and password cannot be empty.');
            return;
        }
        if (!validator.isEmail(registerEmail)) {
            setMessage('Invalid email.');
            return;
        }

        // Username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.
        if (!validator.matches(registerUsername, /^[a-zA-Z0-9_-]+$/)) {
            setMessage('Invalid username. Your username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.');
            return;
        }

        const schema = new passwordValidator();

        // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
        schema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits(2).has().not().spaces().has().symbols();

        if (!schema.validate(registerPassword)) {
            setMessage('Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.');
            return;
        }

        AccountsAPI.register(registerUsername, registerEmail, registerPassword).then((response) => {
            setMessage(response.message);
        });
    };

    return (
        <div>
            <Navbar />
            <Container>
                <Row>
                    <Col>
                        <h1>Login</h1>
                        <Form>
                            <Form.Group as={Row} controlId="formHorizontalUsername" className="mb-2">
                                <Col>
                                    <Form.Control type="text" placeholder="Username" onChange={(e) => setLoginUsername(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formHorizontalPassword" className="mb-2">
                                <Col>
                                    <Form.Control type="password" placeholder='Password' onChange={(e) => setLoginPassword(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col>
                                    <Button onClick={LoginButton}>Login</Button>
                                </Col>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h1>Register</h1>
                        <Form>
                            <Form.Group as={Row} controlId="formHorizontalUsername" className="mb-2">
                                <Col>
                                    <Form.Control type="text" placeholder="Username" onChange={(e) => setRegisterUsername(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formHorizontalEmail" className="mb-2">
                                <Col>
                                    <Form.Control type="email" placeholder="Email" onChange={(e) => setRegisterEmail(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formHorizontalPassword" className="mb-2">
                                <Col>
                                    <Form.Control type="password" placeholder='Password' onChange={(e) => setRegisterPassword(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col>
                                    <Button onClick={RegisterButton}>Register</Button>
                                </Col>
                            </Form.Group>
                        </Form>
                        <Alert variant="primary" style={{ display: message === '' ? 'none' : 'block', marginTop: '1rem' }}>
                            {message}
                        </Alert>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
}

export default LoginRegis;
