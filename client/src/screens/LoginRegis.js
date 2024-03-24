import React, { useEffect, useState } from 'react';
import NavbarComponent from '../components/Navbar';
import { Form, Button, Row, Col, Container, Alert, Modal } from 'react-bootstrap';
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
    const [showModal, setShowModal] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        document.title = 'Buffet - Login/Register';
    }, []);

    const LoginButton = () => {
        if (loginUsername.trim() === '' || loginPassword.trim() === '') {
            setMessage('Username and password cannot be empty.');
            return;
        }
        AccountsAPI.login(loginUsername, loginPassword).then((response) => {
            // If account is unverified, show modal to verify email
            if (response.message === 'Please verify your account before logging in') {
                setMessage(response.message);
                setShowModal(true);
            }
            if (response.status === 200) {
                window.location.href = '/';
            }
            if (response.status === 401) { // Unauthorized
                setMessage(response.message);
            }
            else {
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
            if (response.status === 201) {
                setMessage(response.message);
                setShowModal(true);
            } else {
                setMessage(response.message);
            }
        });
    };

    const VerifyButton = () => {
        if (token.trim() === '') {
            setMessage('Token cannot be empty.');
            return;
        }
        const username = registerUsername || loginUsername;
        const password = registerPassword || loginPassword;
        AccountsAPI.verifyRegistration(username, token).then((response) => {
            if (response.status === 200) {
                AccountsAPI.login(username, password).then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/';
                    } else {
                        setMessage(response.message);
                    }
                });
            }
            if (response.status === 401) {
                setMessage(response.message);
            }
        });
    }

    return (
        <div id="login-regis">
            <NavbarComponent />
            <Container>
                <Row>
                    <Col>
                        <h1>Login</h1>
                        <p>Already have an account? Login.</p>
                        <Form onSubmit={(e) => { e.preventDefault(); LoginButton(); }}>
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
                                    <Button type="submit">Login</Button>
                                </Col>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h1>Register</h1>
                        <p>New to Buffet? Register for an account.</p>
                        <Alert variant="info" style={{ display: 'block', marginTop: '1rem' }}>
                            <Alert.Heading>Rules for usernames and passwords</Alert.Heading>
                            <hr />
                            <ul>
                                <li>Usernames can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.</li>
                                <li>Passwords must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.</li>
                            </ul>
                        </Alert>
                        <Form onSubmit={(e) => { e.preventDefault(); RegisterButton(); }}>
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
                                    <Button type="submit">Register</Button>
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
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Verify your email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>An email has been sent to your email address. Please enter the verification code below.</p>
                    <Form onSubmit={(e) => { e.preventDefault(); VerifyButton(); }}>
                        <Form.Group as={Row} controlId="formHorizontalToken" className="mb-2">
                            <Col>
                                <Form.Control type="text" placeholder="Verification code" onChange={(e) => setToken(e.target.value)} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col>
                                <Button type="submit">Verify</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </div >
    );
}

export default LoginRegis;
