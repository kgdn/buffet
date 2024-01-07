import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Form, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AccountsAPI from '../api/AccountsAPI';

// ManageUser
// The user should be able to change their username and password, and logout

// [Change Username] [Button]
// [Change Password] [Button]
// [Logout] [Button]

function ManageUser() {
    // Username and password should be stored in state
    const [getUserName, setGetUserName] = useState(''); // [Username] [Input field]
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [statusText, setStatusText] = useState('');

    // ChangeUsernameButton
    // Use the AccountsAPI to change the username
    // If the response is successful, display the success message
    // If the response is unsuccessful, display the error message
    const ChangeUsernameButton = () => {
        AccountsAPI.changeUsername(username).then((response) => {
            if (response.status === 200) {
                setStatusText(response.statusText);
                // Refresh the page to display the new username
                window.location.reload();
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    // ChangePasswordButton
    // Use the AccountsAPI to change the password
    // If the response is successful, display the success message
    // If the response is unsuccessful, display the error message
    const ChangePasswordButton = () => {
        AccountsAPI.changePassword(oldPassword, newPassword).then((response) => {
            if (response.status === 200) {
                setStatusText(response.statusText);
                // Refresh the page to display the new username
                window.location.reload();
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    useEffect(() => {
        // if a name already exists, don't run this
        if (!getUserName)
            AccountsAPI.getUserName().then((response) => {
                if (response) {
                    setGetUserName(response);
                }
            });
    }, [getUserName]);

    // Display as follows
    // [Username] [Input field]
    // [Change Username] [Button]
    // [Old Password] [Input field]
    // [New Password] [Input field]
    // [Change Password] [Button]
    return (
        <div>
            <Navbar />
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Manage User</h1>
                        <Form>
                            <Form.Group as={Row} className="mb-3" controlId="formUsername">
                                <Form.Label column sm="2">Username</Form.Label>
                                <Col sm="10">
                                    {/* use getUserName as the default value */}
                                    <Form.Control type="text" placeholder={getUserName} onChange={(event) => setUsername(event.target.value)} />
                                </Col>
                            </Form.Group>
                            <Button variant="primary" onClick={ChangeUsernameButton}>Change Username</Button>
                        </Form>
                        <br />
                        <Form>
                            <Form.Group as={Row} className="mb-3" controlId="formOldPassword">
                                <Form.Label column sm="2">Old Password</Form.Label>
                                <Col sm="10">
                                    <Form.Control type="password" placeholder="Old Password" onChange={(event) => setOldPassword(event.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="formNewPassword">
                                <Form.Label column sm="2">New Password</Form.Label>
                                <Col sm="10">
                                    <Form.Control type="password" placeholder="New Password" onChange={(event) => setNewPassword(event.target.value)} />
                                </Col>
                            </Form.Group>
                            {/* Display change button and log out button side by side */}
                            <Button variant="primary" onClick={ChangePasswordButton}>Change Password</Button>
                        </Form>
                        <br />
                        <Button variant="primary" onClick={() => {
                            AccountsAPI.logout();
                            // go to /logout
                            window.location.href = '/';
                        }}>Log Out</Button>
                        <br />
                        <p>{statusText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageUser;
