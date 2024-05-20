/*
* LoginRegis.tsx - Login and registration screen for the application.
* Copyright (C) 2024, Kieran Gordon
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
* 
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import React, { useEffect, useState } from 'react';
import NavbarComponent from '../components/Navbar';
import { Form, Button, Row, Col, Container, Alert, Modal, ButtonGroup } from 'react-bootstrap';
import { logIn, register, verifyRegistration, resendVerificationEmail } from '../api/AccountsAPI';
import validator from 'validator';
import passwordValidator from 'password-validator';
import Footer from '../components/Footer';

const LoginRegis: React.FC = (): React.ReactElement => {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [token, setToken] = useState('');
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorMessage, setTwoFactorMessage] = useState(''); // Error message for 2FA
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [emailMessage, setEmailMessage] = useState(''); // Error message for email verification
    const schema = new passwordValidator();

    useEffect(() => {
        document.title = 'Buffet - Login/Register';
    }, []);

    const LoginButton = () => {
        if (loginUsername.trim() === '' || loginPassword.trim() === '') {
            setErrorMessage('Username and password cannot be empty.');
            return;
        }
        logIn(loginUsername, loginPassword, token).then((response) => {
            // If account is unverified, show modal to verify email
            switch (response.message) {
                case 'Please verify your account before logging in':
                    setShowModal(true);
                    break;
                case 'Invalid 2FA code':
                    setTwoFactorMessage('Invalid two-factor code.');
                    break;
                case 'Please provide the 2FA code':
                    setShowTwoFactorModal(true);
                    break;
                case 'Login is successful':
                    window.location.href = '/';
                    break;
                default:
                    setErrorMessage(response.message);
                    break;
            }
        }).catch((error) => {
            setTwoFactorMessage('An error occurred while logging in. Please try again. Error: ' + error);
        });
    };

    const RegisterButton = () => {
        if (registerUsername.trim() === '' || registerEmail.trim() === '' || registerPassword.trim() === '') {
            setErrorMessage('Username, email, and password cannot be empty.');
            return;
        }

        if (!validator.isEmail(registerEmail)) {
            setErrorMessage('Invalid email.');
            return;
        }

        // Username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.
        if (!validator.matches(registerUsername, /^[a-zA-Z0-9_-]+$/)) {
            setErrorMessage('Invalid username. Your username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.');
            return;
        }

        // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
        schema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits(2).has().not().spaces().has().symbols();

        if (!schema.validate(registerPassword)) {
            setErrorMessage('Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.');
            return;
        }

        // Register the user
        register(registerUsername, registerEmail, registerPassword).then((response) => {
            if (response.status === 201) {
                setShowModal(true);
            } else {
                setErrorMessage(response.message);
            }
        });
    };

    const VerifyButton = () => {
        if (token.trim() === '') {
            setTwoFactorMessage('Verification code cannot be empty.');
            return;
        }
        const username = registerUsername || loginUsername;
        const password = registerPassword || loginPassword;
        verifyRegistration(username, token).then((response) => {
            if (response.status === 200) {
                logIn(username, password, '').then((response) => {
                    if (response.status === 200) {
                        window.location.href = '/';
                    } else {
                        setEmailMessage(response.message);
                    }
                });
            }
            if (response.status === 401) {
                setEmailMessage(response.message);
            }
        });
    }

    const TwoFactorButton = () => {
        if (twoFactorCode.trim() === '') {
            setTwoFactorMessage('Two-factor code cannot be empty.');
            return;
        }
        logIn(loginUsername, loginPassword, twoFactorCode).then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            } else {
                setTwoFactorMessage(response.message);
            }
        });
    }

    const ResendVerificationEmailButton = () => {
        const username = registerUsername || loginUsername;
        resendVerificationEmail(username).then((response) => {
            setEmailMessage(response.message);
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
                        <Alert variant="danger" style={{ display: errorMessage === '' ? 'none' : 'block', marginTop: '1rem' }}>
                            {errorMessage}
                        </Alert>
                        <Form onSubmit={(e) => { e.preventDefault(); LoginButton(); }}>
                            <Form.Group as={Row} controlId="formLoginUsername" className="mb-2">
                                <Col>
                                    <Form.Control type="text" placeholder="Username" onChange={(e) => setLoginUsername(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formLoginPassword" className="mb-2">
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
                            <Form.Group as={Row} controlId="formRegisterUsername" className="mb-2">
                                <Col>
                                    <Form.Control type="text" placeholder="Username" onChange={(e) => setRegisterUsername(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formRegisterEmail" className="mb-2">
                                <Col>
                                    <Form.Control type="email" placeholder="Email" onChange={(e) => setRegisterEmail(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formRegisterPassword" className="mb-2">
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
                        <Form.Group as={Row} controlId="formToken" className="mb-2">
                            <Col>
                                <Form.Control type="text" placeholder="Verification code" onChange={(e) => setToken(e.target.value)} />
                            </Col>
                        </Form.Group>
                    </Form>
                    <Alert variant="danger" style={{ display: emailMessage === '' ? 'none' : 'block', marginTop: '1rem' }}>
                        {emailMessage}
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="primary" onClick={VerifyButton}>Verify</Button>
                        <Button variant="danger" onClick={ResendVerificationEmailButton}>Resend email</Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>

            <Modal show={showTwoFactorModal} onHide={() => setShowTwoFactorModal(false)} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Two-factor authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Enter the two-factor authentication code from your authenticator app.</p>
                    <p>If you have not set up two-factor authentication, please contact the system administrator.</p>
                    <Form onSubmit={(e) => { e.preventDefault(); TwoFactorButton(); }}>
                        <Form.Group as={Row} controlId="formTwoFactorCode" className="mb-2">
                            <Col>
                                <Form.Control type="text" placeholder="Two-factor code" onChange={(e) => setTwoFactorCode(e.target.value)} />
                            </Col>
                        </Form.Group>
                        <Alert variant="danger" style={{ display: twoFactorMessage === '' ? 'none' : 'block', marginTop: '1rem' }}>
                            {twoFactorMessage}
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="primary" onClick={TwoFactorButton}>Submit</Button>
                        <Button variant="danger" onClick={() => setShowTwoFactorModal(false)}>Cancel</Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default LoginRegis;
