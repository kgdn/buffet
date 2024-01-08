import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Modal from 'react-bootstrap/Modal';
import AccountsAPI from '../api/AccountsAPI';
import validator from 'validator';
import passwordValidator from 'password-validator';
import 'bootstrap/dist/css/bootstrap.min.css';

function ManageUser() {
    const [getEmail, setCurrentEmail] = useState('');
    const [getUserName, setCurrentUserName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [statusText, setStatusText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        document.title = 'Buffet - Manage User';
    }, []);

    const ChangeUsernameButton = () => {
        if (username.trim() === '' || currentPassword.trim() === '') {
            setStatusText('Username and password cannot be empty.');
            return;
        }

        AccountsAPI.changeUsername(username, currentPassword).then((response) => {
            if (response.status === 200) {
                setStatusText(response.statusText);
                // Refresh the page to display the new username
                window.location.reload();
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    const ChangePasswordButton = () => {

        if (oldPassword.trim() === '' || newPassword.trim() === '') {
            setStatusText('Old password and new password cannot be empty.');
            return;
        }

        const schema = new passwordValidator();

        // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
        schema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits(2).has().not().spaces().has().symbols()

        if (!schema.validate(newPassword)) {
            setStatusText('Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.');
            return;
        }

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

    const ChangeEmailButton = () => {
        if (email.trim() === '' || currentPassword.trim() === '') {
            setStatusText('Email and password cannot be empty.');
            return;
        }

        // Ensure email is in a valid format
        if (!validator.isEmail(email)) {
            setStatusText('Email is not in a valid format.');
            return;
        }

        AccountsAPI.changeEmail(email, currentPassword).then((response) => {
            if (response.status === 200) {
                setStatusText(response.statusText);
                window.location.reload();
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    const DeleteAccountButton = () => {
        if (currentPassword.trim() === '') {
            setStatusText('Password cannot be empty.');
            return;
        }

        AccountsAPI.deleteAccount(currentPassword).then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            } else {
                setStatusText(response.statusText);
            }
        });
    }

    useEffect(() => {
        if (!getUserName)
            AccountsAPI.getUserDetails().then((response) => {
                if (response.status === 200) {
                    setCurrentUserName(response.data.username);
                } else {
                    setCurrentUserName('No username found');
                }
            });
        if (!email)
            AccountsAPI.getUserDetails().then((response) => {
                if (response.status === 200) {
                    setCurrentEmail(response.data.email);
                } else {
                    setCurrentEmail('No email found');
                }
            });
        // Get role from the API
        if (!role)
            AccountsAPI.getUserDetails().then((response) => {
                if (response.status === 200) {
                    setRole(response.data.role);
                }
            });
    }, [getUserName, email, role]);

    return (
        <div>
            <Navbar />
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Manage User</h1>
                        {/* Username input field */}
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder={getUserName} aria-label="Username" aria-describedby="basic-addon1" onChange={(event) => setUsername(event.target.value)} />
                        </div>
                        {/* Email input field */}
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder={getEmail} aria-label="Email" aria-describedby="basic-addon1" onChange={(event) => setEmail(event.target.value)} />
                        </div>
                        {/* Password input field, hide the password */}
                        <div className="input-group mb-3">
                            <input type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1" onChange={(event) => setCurrentPassword(event.target.value)} />
                        </div>
                        {/* Change username button */}
                        <div className="btn-group mb-3" role="group">
                            <button className="btn btn-primary" onClick={ChangeUsernameButton}>Change Username</button>
                            <button className="btn btn-primary" onClick={ChangeEmailButton}>Change Email</button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {/* Display old password field */}
                        <div className="input-group mb-3">
                            <input type="password" className="form-control" placeholder="Old Password" aria-label="Old Password" aria-describedby="basic-addon1" onChange={(event) => setOldPassword(event.target.value)} />
                        </div>
                        {/* Display new password field */}
                        <div className="input-group mb-3">
                            <input type="password" className="form-control" placeholder="New Password" aria-label="New Password" aria-describedby="basic-addon1" onChange={(event) => setNewPassword(event.target.value)} />
                        </div>
                        {/* Change password button */}
                        <div className="btn-group mb-3" role="group">
                            <button className="btn btn-primary" onClick={ChangePasswordButton}>Change Password</button>
                        </div>
                        {/* Display log out button and delete account button side by side */}
                        <div className="btn-group mb-3 float-end" role="group">
                            <button className="btn btn-warning" onClick={() => {
                                AccountsAPI.logout().then((response) => {
                                    if (response.status === 200) {
                                        window.location.href = '/';
                                    }
                                });
                            }}>Log Out</button>
                            {/* Delete account, call the delete account API */}
                            {/* If the user is an admin, do not display the delete account button */}
                            {role === 'admin' ?
                                <></>
                                :
                                <button className="btn btn-danger" onClick={() => { setShowDeleteModal(true) }}>Delete Account</button>
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {/* Display status text */}
                        <p style={{ color: 'red' }}>{statusText}</p>
                    </div>
                </div>

                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Account Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        {/* display status text */}
                        <p style={{ color: 'red' }}>{statusText}</p>
                    </Modal.Body>
                    {/* Enter the password to confirm account deletion in a field */}
                    {/* Add confirm and cancel buttons */}
                    <Modal.Footer>
                        <input type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1" onChange={(event) => setCurrentPassword(event.target.value)} />
                        <button className="btn btn-danger" onClick={() => { DeleteAccountButton() }}>Confirm</button>
                        <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default ManageUser;
