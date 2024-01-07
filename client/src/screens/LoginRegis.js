import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Form, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import AccountsAPI from '../api/AccountsAPI';

function LoginRegis() {
    // Login data should include username and password
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    // Register data should include username, password
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [statusText, setStatusText] = useState('');

    const navigate = useNavigate();

    const LoginButton = () => {
        // Use the AccountsAPI to login
        // If the response is successful, dispatch the login action and redirect to the home page
        // If the response is unsuccessful, display the error message
        AccountsAPI.login(loginUsername, loginPassword).then((response) => {
            if (response.status === 200) {
                navigate('/');
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    const RegisterButton = () => {
        // Use the AccountsAPI to register
        // If the response is successful, dispatch the login action and redirect to the home page
        // If the response is unsuccessful, display the error message
        AccountsAPI.register(registerUsername, registerPassword).then((response) => {
            if (response.status === 200) {
                setStatusText(response.statusText);
                // wait for 1 second then redirect to login page
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    return (
        // Return a login form and a register form as follows
        // Login form should include a username field, a password field, and a login button
        // Register form should include a username field, a password field, and a register button

        // Login
        // [Username] [Input field]
        // [Password] [Input field]
        // [Login] [Button]

        // New to the site? Register here!
        // [Username] [Input field]
        // [Password] [Input field]
        // [Register] [Button]

        // On register, send a POST request to the server to create a new user
        // If the response is successful, dispatch the login action and redirect to the home page
        // On login, send a POST request to the server to login
        // If the response is successful, dispatch the login action and redirect to the home page

        // Display login above register

        <div>
            <Navbar />
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Login</h1>
                        <Form>
                            <Form.Group as={Row} controlId="formHorizontalUsername" className="mb-2">
                                <Col>
                                    <Form.Control type="text" placeholder="Username" onChange={(e) => {
                                        setLoginUsername(
                                            e.target.value
                                        );
                                    }
                                    } />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formHorizontalPassword" className="mb-2">
                                <Col>
                                    <Form.Control type="password" placeholder='Password' onChange={(e) => {
                                        setLoginPassword(
                                            e.target.value
                                        );
                                    }
                                    } />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col>
                                    <Button onClick={LoginButton}>Login</Button>
                                </Col>
                            </Form.Group>
                        </Form>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <h1>Register</h1>
                        <Form>
                            <Form.Group as={Row} controlId="formHorizontalUsername" className="mb-2">
                                <Col>
                                    <Form.Control type="text" placeholder="Username" onChange={(e) => {
                                        setRegisterUsername(
                                            e.target.value
                                        );
                                    }
                                    } />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formHorizontalPassword" className="mb-2">
                                <Col>
                                    <Form.Control type="password" placeholder='Password' onChange={(e) => {
                                        setRegisterPassword(
                                            e.target.value
                                        );
                                    }
                                    } />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col>
                                    <Button onClick={RegisterButton}>Register</Button>
                                </Col>
                            </Form.Group>
                        </Form>
                        <br />
                        <p>{statusText}</p>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default LoginRegis;