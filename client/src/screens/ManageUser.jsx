/*
* ManageUser.jsx - Account management screen for the application.
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

import React, { useState, useEffect, useContext } from 'react';
import NavbarComponent from '../components/Navbar';
import { Modal, Form, Button, ButtonGroup, Container, Row, Col, Alert, Image } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';
import validator from 'validator';
import passwordValidator from 'password-validator';
import Footer from '../components/Footer';
import { AuthContext } from '../contexts/AuthContext';

function ManageUser() {
    const { user, logout } = useContext(AuthContext);
    const [getEmail, setCurrentEmail] = useState('');
    const [getUserName, setCurrentUserName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pageMessage, setMessage] = useState('');
    const [deleteMessage, setStopMessage] = useState('');
    const [twoFactorMessage, setTwoFactorMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [showDisableTwoFactorModal, setShowDisableTwoFactorModal] = useState(false);

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
        logout();
    };

    const decodeBase64 = (input) => {
        return `data:image/png;base64,${input}`;
    };

    const EnableTwoFactorButton = async () => {
        try {
            AccountsAPI.enableTwoFactorAuth().then((response) => {
                if (response.status === 200) {
                    setQrCode(response.data.qr_code);
                    setShowTwoFactorModal(true);
                } else {
                    setTwoFactorMessage(response.message);
                }
            });
        } catch (error) {
            setTwoFactorMessage(error.message);
        }
    };

    const VerifyTwoFactorButton = async () => {
        try {
            AccountsAPI.verifyTwoFactorAuth(twoFactorCode).then((response) => {
                if (response.status === 200) {
                    window.location.reload();
                } else {
                    setTwoFactorMessage(response.message);
                }
            });
        } catch (error) {
            setTwoFactorMessage(error.message);
        }
    };

    const DisableTwoFactorButton = async () => {
        // trim the password
        if (currentPassword.trim() === '') {
            setTwoFactorMessage('Password cannot be empty.');
            return;
        }

        try {
            AccountsAPI.disableTwoFactorAuth(currentPassword).then((response) => {
                if (response.status === 200) {
                    window.location.reload();
                } else {
                    setTwoFactorMessage(response.message);
                }
            });
        } catch (error) {
            setTwoFactorMessage(error.message);
        }
    };

    useEffect(() => {
        if (user) {
            setCurrentEmail(user.email);
            setCurrentUserName(user.username);
            setRole(user.role);
            setTwoFactorEnabled(user.two_factor_enabled);
        }
    }, [user]);

    return (
        <div id="manage-user">
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
                        <Form onSubmit={(e) => { e.preventDefault(); ChangePasswordButton(); }}>
                            <Form.Group className="mb-3">
                                <Form.Control type="password" placeholder="Old Password" onChange={(event) => setOldPassword(event.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control type="password" placeholder="New Password" onChange={(event) => setNewPassword(event.target.value)} />
                            </Form.Group>
                            <ButtonGroup className="mb-3">
                                <Button variant="primary" type="submit">
                                    Change Password
                                </Button>
                                {twoFactorEnabled ? (
                                    <Button variant="danger" onClick={() => setShowDisableTwoFactorModal(true)}>
                                        Disable 2FA
                                    </Button>
                                ) : (
                                    <Button variant="success" onClick={EnableTwoFactorButton}>
                                        Enable 2FA
                                    </Button>
                                )}
                            </ButtonGroup>
                            <ButtonGroup className="mb-3 float-end">
                                <Button variant="warning" onClick={LogoutButton}>
                                    Log Out
                                </Button>
                                {role === 'admin' ? (
                                    <></>
                                ) : (
                                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
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

            {/* Delete account modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    {deleteMessage === '' ? (
                        <></>
                    ) : (
                        <Alert variant="primary" role="alert">
                            {deleteMessage}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Form.Control type="password" placeholder="Password" onChange={(event) => setCurrentPassword(event.target.value)} />
                    <Button variant="danger" onClick={DeleteAccountButton}>
                        Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Two-factor authentication modals */}
            <Modal show={showTwoFactorModal} onHide={() => setShowTwoFactorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enable Two-Factor Authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Scan the QR code below with your two-factor authentication app to enable two-factor authentication.</p>
                    <Image src={decodeBase64(qrCode)} alt="QR Code" rounded fluid className='mb-3 mt-3' />
                    <Form.Control type="text" placeholder="Two-factor authentication code" onChange={(event) => setTwoFactorCode(event.target.value)} />
                    {twoFactorMessage === '' ? (
                        <></>
                    ) : (
                        <Alert variant="primary" role="alert">
                            {twoFactorMessage}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={VerifyTwoFactorButton}>
                        Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => setShowTwoFactorModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Disable two-factor authentication modal */}
            <Modal show={showDisableTwoFactorModal} onHide={() => setShowDisableTwoFactorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Disable Two-Factor Authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to disable two-factor authentication?</p>
                    {twoFactorMessage === '' ? (
                        <></>
                    ) : (
                        <Alert variant="primary" role="alert">
                            {twoFactorMessage}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Form.Control type="password" placeholder="Password" onChange={(event) => setCurrentPassword(event.target.value)} />
                    <Button variant="danger" onClick={DisableTwoFactorButton}>
                        Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDisableTwoFactorModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <Footer />
        </div >
    );
}

export default ManageUser;