import React, { useState, useEffect } from 'react';
import NavbarComponent from '../components/Navbar';
import { Modal, Form, Button, ButtonGroup, Container, Row, Col, Alert } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';
import validator from 'validator';
import passwordValidator from 'password-validator';
import Footer from '../components/Footer';

function ManageUser() {
    const [getEmail, setCurrentEmail] = useState('');
    const [getUserName, setCurrentUserName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pageMessage, setMessage] = useState('');
    const [deleteMessage, setStopMessage] = useState('');
    const [showStopModal, setShowStopModal] = useState(false);

    useEffect(() => {
        document.title = 'Buffet - Manage User';
    }, []);

    const ChangeUsernameButton = () => {
        if (username.trim() === '' || currentPassword.trim() === '') {
            setMessage('Username and password cannot be empty.');
            return;
        }

        AccountsAPI.changeUsername(username, currentPassword).then((response) => {
            if (response.status === 200) {
                setMessage(response.message);
                window.location.reload();
            } else {
                setMessage(response.message);
            }
        });
    };

    const ChangePasswordButton = () => {
        if (oldPassword.trim() === '' || newPassword.trim() === '') {
            setMessage('Old password and new password cannot be empty.');
            return;
        }

        const schema = new passwordValidator();

        // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
        schema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits(2).has().not().spaces().has().symbols();

        if (!schema.validate(newPassword)) {
            setMessage('Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.');
            return;
        }

        // If old password and new password are the same, return
        if (oldPassword === newPassword) {
            setMessage('Old password and new password cannot be the same.');
            return;
        }

        AccountsAPI.changePassword(oldPassword, newPassword).then((response) => {
            if (response.status === 200) {
                setMessage(response.message);
                window.location.reload();
            } else {
                setMessage(response.message);
            }
        });
    };

    const ChangeEmailButton = () => {
        if (email.trim() === '' || currentPassword.trim() === '') {
            setMessage('Email and password cannot be empty.');
            return;
        }

        if (!validator.isEmail(email)) {
            setMessage('Invalid email.');
            return;
        }

        AccountsAPI.changeEmail(email, currentPassword).then((response) => {
            if (response.status === 200) {
                setMessage(response.message);
                window.location.reload();
            } else {
                setMessage(response.message);
            }
        });
    };

    const DeleteAccountButton = () => {
        if (currentPassword.trim() === '') {
            setMessage('Password cannot be empty.');
            return;
        }

        AccountsAPI.deleteAccount(currentPassword).then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            } else {
                setStopMessage(response.message);
            }
        });
    };

    const LogoutButton = () => {
        AccountsAPI.logout().then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            }
        });
    };

    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setCurrentEmail(response.data.email);
                setCurrentUserName(response.data.username);
                setRole(response.data.role);
            }
        });
    }, []);

    return (
        <div>
            <NavbarComponent />
            <Container>
                <Row>
                    <Col>
                        <h1>Manage User</h1>
                        <Alert variant="info" style={{ display: 'block', marginTop: '1rem' }}>
                            <Alert.Heading>Rules for usernames and passwords</Alert.Heading>
                            <hr />
                            <ul>
                                <li>Usernames can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.</li>
                                <li>Passwords must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.</li>
                            </ul>
                        </Alert>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder={getUserName} onChange={(event) => setUsername(event.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder={getEmail} onChange={(event) => setEmail(event.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control type="password" placeholder="Password" onChange={(event) => setCurrentPassword(event.target.value)} />
                            </Form.Group>
                            <ButtonGroup className="mb-3">
                                <Button variant="primary" onClick={ChangeUsernameButton}>
                                    Change Username
                                </Button>
                                <Button variant="primary" onClick={ChangeEmailButton}>
                                    Change Email
                                </Button>
                            </ButtonGroup>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Control type="password" placeholder="Old Password" onChange={(event) => setOldPassword(event.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control type="password" placeholder="New Password" onChange={(event) => setNewPassword(event.target.value)} />
                            </Form.Group>
                            <Button className="me-2" variant="primary" onClick={ChangePasswordButton}>
                                Change Password
                            </Button>
                            {/* display button on the right */}
                            <ButtonGroup className="mb-3 float-end">
                                <Button variant="warning" onClick={LogoutButton}>
                                    Log Out
                                </Button>
                                {role === 'admin' ? (
                                    <></>
                                ) : (
                                    <Button variant="danger" onClick={() => setShowStopModal(true)}>
                                        Delete Account
                                    </Button>
                                )}
                            </ButtonGroup>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {pageMessage === '' ? (
                            <></>
                        ) : (
                            <Alert variant="primary" role="alert">
                                {pageMessage}
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>

            <Modal show={showStopModal} onHide={() => setShowStopModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    {deleteMessage === '' ? (
                        <></>
                    ) : (
                        <Alert variant="primary" role="alert">
                            <p>{deleteMessage}</p>
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Form.Control type="password" placeholder="Password" onChange={(event) => setCurrentPassword(event.target.value)} />
                    <Button variant="danger" onClick={DeleteAccountButton}>
                        Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => setShowStopModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <Footer />
        </div>
    );
}

export default ManageUser;