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
    const [pageMessage, setMessage] = useState('');
    const [deleteMessage, setStopMessage] = useState('');
    const [showStopModal, setShowStopModal] = useState(false)

    useEffect(() => {
        document.title = 'Buffet - Manage User';
    }, []);

    // Get the user's username and email from local storage
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
    }

    // Change the user's password according to the password policy
    const ChangePasswordButton = () => {

        if (oldPassword.trim() === '' || newPassword.trim() === '') {
            setMessage('Old password and new password cannot be empty.');
            return;
        }

        const schema = new passwordValidator();

        // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
        schema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits(2).has().not().spaces().has().symbols()

        if (!schema.validate(newPassword)) {
            setMessage('Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces.');
            return;
        }

        AccountsAPI.changePassword(oldPassword, newPassword).then((response) => {
            if (response.status === 200) {
                setMessage(response.message);
                // Refresh the page to display the new username
                window.location.reload();
            } else {
                setMessage(response.message);
            }
        });
    }

    // Change the user's email
    const ChangeEmailButton = () => {
        if (email.trim() === '' || currentPassword.trim() === '') {
            setMessage('Email and password cannot be empty.');
            return;
        }

        // Ensure email is in a valid format
        if (!validator.isEmail(email)) {
            setMessage('Email is not in a valid format.');
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
    }

    // Delete the user's account
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
    }

    // Log the user out
    const LogoutButton = () => {
        AccountsAPI.logout().then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            }
        });
    }

    // Get the user's details on page load
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
            {/* If the user is logged in, display the page */}
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
                            <button className="btn btn-warning" onClick={LogoutButton}>Log Out</button>
                            {/* Delete account, call the delete account API */}
                            {/* If the user is an admin, do not display the delete account button */}
                            {role === 'admin' ?
                                <></>
                                :
                                <button className="btn btn-danger" onClick={() => { setShowStopModal(true) }}>Delete Account</button>
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {/* Display the status text */}
                        {pageMessage === '' ?
                            <></>
                            :
                            <div className='alert alert-primary' role='alert'>
                                {pageMessage}
                            </div>
                        }
                    </div>
                </div>

                <Modal show={showStopModal} onHide={() => setShowStopModal(false)} >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Account Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        {/* If message is not empty, display it in a red paragraph */}
                        {deleteMessage === '' ?
                            <></>
                            :
                            <div className='alert alert-primary' role='alert'>
                                <p>{deleteMessage}</p>
                            </div>
                        }
                    </Modal.Body>
                    {/* Enter the password to confirm account deletion in a field */}
                    {/* Add confirm and cancel buttons */}
                    <Modal.Footer>
                        <input type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1" onChange={(event) => setCurrentPassword(event.target.value)} />
                        <button className="btn btn-danger" onClick={() => { DeleteAccountButton() }}>Confirm</button>
                        <button className="btn btn-secondary" onClick={() => setShowStopModal(false)}>Cancel</button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default ManageUser;