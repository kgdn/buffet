import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AdminAPI from '../api/AdminAPI';
import AccountsAPI from '../api/AccountsAPI';
import validator from 'validator';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Admin() {

    const [users, setUsers] = useState([]);
    const [role, setRole] = useState('');
    const [vms, setVMs] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [userSearchQuery, setSearchQuery] = useState('');
    const [vmSearchQuery, setVmSearchQuery] = useState('');
    const [showStopUserModal, setShowStopUserModal] = useState(false);
    const [showStopVMModal, setShowStopVMModal] = useState(false);
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [vmStatusText, setVMStatusText] = useState('');
    const [emailStatusText, setEmailStatusText] = useState('');
    const [usernameStatusText, setUsernameStatusText] = useState('');
    const [deleteUserStatusText, setStopUserStatusText] = useState('');
    const [deleteVMStatusText, setStopVMStatusText] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedVM, setSelectedVM] = useState('');

    useEffect(() => {
        document.title = 'Buffet - Admin';
    }, []);

    useEffect(() => {
        // Get all users
        AdminAPI.getAllUsers()
            .then(response => {
                if (response.status === 200) {
                    setUsers(response.data);
                }
                else {
                    console.error(response.statusText);
                }
            })
            .catch(error => console.error(error));
        AdminAPI.getAllVMs()
            .then(response => {
                if (response.status === 200) {
                    setVMs(response.data);
                }
                else {
                    setVMStatusText(response.statusText);
                }
            })
    }, []);

    // Get the role of the user
    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setRole(response.data.role);
            }
        });
    }, []);

    const filteredUsers = users.filter(user => {
        return user.username.toLowerCase().includes(userSearchQuery.toLowerCase());
    });

    const filteredVMs = vms.filter(vm => {
        return vm.iso.toLowerCase().includes(vmSearchQuery.toLowerCase());
    });

    const changeUsername = (id) => {
        if (newUsername.trim() === '') {
            setUsernameStatusText('Username cannot be empty');
            return;
        }

        AdminAPI.changeUsername(id, newUsername).then(response => {
            if (response.status === 200) {
                // Update the users list
                setUsers(users.map(user => {
                    if (user.id === id) {
                        user.username = newUsername;
                    }
                    return user;
                }));
                setUsernameStatusText('');
            }
            else {
                setUsernameStatusText(response.statusText);
            }
        }).catch(error => console.error(error));
    }

    const changeEmail = (id) => {
        if (newEmail.trim() === '') {
            setEmailStatusText('Email cannot be empty');
            return;
        }

        if (!validator.isEmail(newEmail)) {
            setEmailStatusText('Email is in an invalid format');
            return;
        }


        AdminAPI.changeEmail(id, newEmail).then(response => {
            if (response.status === 200) {
                // Update the users list
                setUsers(users.map(user => {
                    if (user.id === id) {
                        user.email = newEmail;
                    }
                    return user;
                }));
                setEmailStatusText('');
            }
            else {
                setEmailStatusText(response.statusText);
            }
        }).catch(error => console.error(error));
    }

    const deleteUser = (id) => {
        AdminAPI.deleteUser(id)
            .then(response => {
                if (response.status === 200) {
                    // Update the users list
                    setUsers(users.filter(user => user.id !== id));
                }
                else {
                    setStopUserStatusText(response.statusText);
                }
                setStopUserStatusText('');
            })
            .catch(error => console.error(error));
    }

    const deleteVM = (id) => {
        AdminAPI.deleteVM(id)
            .then(response => {
                if (response.status === 200) {
                    // Update the VMs list
                    setVMs(vms.filter(vm => vm.id !== id));
                }
                else {
                    setStopVMStatusText(response.statusText);
                }
                setStopUserStatusText('');
            })
            .catch(error => console.error(error));
    }

    return (
        // Map through all users and display their information in a Card
        <div>
            <Navbar />
            {/* If user.role is admin, display the admin panel, otherwise display an error */}
            {role === 'admin' ?
                <div>
                    <div className="container">
                        <h1>Admin Panel</h1>
                        <h2>Users</h2>
                        <div className="row">
                            <div className="col">
                                <form className="form-inline">
                                    <input className="form-control mb-3" type="search" placeholder="Search" aria-label="Search" value={userSearchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </form>
                            </div>
                        </div>
                        <div className="row">
                            {filteredUsers.map((user) => (
                                <div key={user.name} className="col-12 col-md-6 col-lg-4" style={{ paddingBottom: '1rem' }}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">{user.username}</h5>
                                            <p className="card-text">Email: {user.email}</p>
                                            <p className="card-text">Role: {user.role}</p>
                                            <p className="card-text">ID: {user.id}</p>
                                            {/* Format the date to a readable format */}
                                            <p className="card-text">Last Login: {user.login_time.split('T')[0]} {user.login_time.split('T')[1].split('.')[0]} from {user.ip}</p>
                                        </div>
                                        {/* Change username and email (top) */}
                                        {/* Delete user, delete VM (if the user has one) on bottom, add spacing between top and bottom */}
                                        <div className="card-footer">
                                            <div className="row" style={{ paddingBottom: '1rem' }}>
                                                <div className="col">
                                                    <div className="btn-group" role="group">
                                                        <button className="btn btn-primary" onClick={() => { setSelectedUser(user.id); setNewUsername(user.username); setShowUsernameModal(true); }}>Change Username</button>
                                                        <button className="btn btn-primary" onClick={() => { setSelectedUser(user.id); setNewEmail(user.email); setShowEmailModal(true); }}>Change Email</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col">
                                                    <div className="btn-group" role="group">
                                                        {/* If the user is not an admin, allow the admin to delete the user */}
                                                        {user.role !== 'admin' ?
                                                            <button className="btn btn-danger" onClick={() => { setSelectedUser(user.id); setShowStopUserModal(true); }}>Delete user</button>
                                                            :
                                                            <button className="btn btn-secondary" disabled>Cannot delete admin</button>
                                                        }
                                                        {/* If the user_id matches the user_id of the VM, show the delete VM button */}
                                                        {vms.filter(vm => vm.user_id === user.id).length > 0 &&
                                                            <button className="btn btn-danger" onClick={() => { setSelectedVM(vms.filter(vm => vm.user_id === user.id)[0].id); setShowStopVMModal(true); }}>Stop VM</button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Search bar for VMs */}
                        <h2>Virtual Machines</h2>
                        <div className="row">
                            <div className="col">
                                <form className="form-inline">
                                    <input className="form-control mb-3" type="search" placeholder="Search" aria-label="Search" value={vmSearchQuery} onChange={(e) => setVmSearchQuery(e.target.value)} />
                                </form>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                {/* If no VMs are found, display the error */}
                                {vmStatusText !== '' &&
                                    <div className="alert alert-danger" role="alert">
                                        {vmStatusText}
                                    </div>
                                }
                            </div>
                            {filteredVMs.map((vm) => (
                                <div key={vm.name} className="col-12 col-md-6 col-lg-4" style={{ paddingBottom: '1rem' }}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">{vm.iso}</h5>
                                            <p className="card-text">Owner: {vm.user_id}</p>
                                            <p className='card-text'>VM ID: {vm.id}</p>
                                            <p className='card-text'>Port: {vm.port} - WebSocket Port: {vm.wsport}</p>
                                        </div>
                                        <div className="card-footer">
                                            <button className="btn btn-danger" onClick={() => { setSelectedVM(vm.id); setShowStopVMModal(true); }}>Stop VM</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Delete user confirmation modal */}
                    <Modal show={showStopUserModal} onHide={() => setShowStopUserModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete this user?
                            {/* if statusText is not empty, display the error */}
                            {deleteUserStatusText !== '' &&
                                <div className="alert alert-danger" role="alert" style={{ marginTop: '1rem' }}>
                                    {deleteUserStatusText}
                                </div>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            {/* If status code is 200, delete the user, else display the error */}

                            <button className="btn btn-danger" onClick={() => { deleteUser(selectedUser); setShowStopUserModal(false); }}>Stop</button>
                            <button className="btn btn-secondary" onClick={() => setShowStopUserModal(false)}>Cancel</button>
                        </Modal.Footer>
                    </Modal>
                    {/* Stop VM confirmation modal */}
                    <Modal show={showStopVMModal} onHide={() => setShowStopVMModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to stop this VM?
                            {deleteVMStatusText !== '' &&
                                <div className="alert alert-danger" role="alert" style={{ marginTop: '1rem' }}>
                                    {deleteVMStatusText}
                                </div>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-danger" onClick={() => { deleteVM(selectedVM); setShowStopVMModal(false); }}>Stop</button>
                            <button className="btn btn-secondary" onClick={() => setShowStopVMModal(false)}>Cancel</button>
                        </Modal.Footer>
                    </Modal>
                    {/* New username modal */}
                    <Modal show={showUsernameModal} onHide={() => setShowUsernameModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Change Username</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <input className="form-control" type="text" placeholder="New Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            {usernameStatusText !== '' &&
                                <div className="alert alert-danger" role="alert" style={{ marginTop: '1rem' }}>
                                    {usernameStatusText}
                                </div>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-primary" onClick={() => { changeUsername(selectedUser); setShowUsernameModal(false); }}>Change</button>
                            <button className="btn btn-secondary" onClick={() => setShowUsernameModal(false)}>Cancel</button>
                        </Modal.Footer>
                    </Modal>
                    {/* New email modal */}
                    <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Change Email</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <input className="form-control" type="text" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                            {emailStatusText !== '' &&
                                <div className="alert alert-danger" role="alert" style={{ marginTop: '1rem' }}>
                                    {emailStatusText}
                                </div>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-primary" onClick={() => { changeEmail(selectedUser); setShowEmailModal(false); }}>Change</button>
                            <button className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                        </Modal.Footer>
                    </Modal>
                </div >
                :
                <div className="container">
                    <h1>Admin</h1>
                    <div className="alert alert-danger" role="alert">
                        You are not authorized to view this page.
                    </div>
                </div>
            }
        </div>
    )
}

export default Admin;

