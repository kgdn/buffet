import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AdminAPI from '../api/AdminAPI';
import validator from 'validator';
import { Modal, Tab, Tabs } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Admin() {

    const [users, setUsers] = useState([]);
    const [vms, setVMs] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [userSearchQuery, setSearchQuery] = useState('');
    const [vmSearchQuery, setVmSearchQuery] = useState('');
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showStopVMModal, setShowStopVMModal] = useState(false);
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [vmMessage, setVMMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [deleteUserMessage, setDeleteUserMessage] = useState('');
    const [stopVMMessage, setStopVMMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedVM, setSelectedVM] = useState('');
    const [bannedUsers, setBannedUsers] = useState([]);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [banMessage, setBanMessage] = useState('');
    const [unbanMessage, setUnbanMessage] = useState('');
    const [showUnbanModal, setShowUnbanModal] = useState(false);

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
                    console.error(response.message);
                }
            })
            .catch(error => console.error(error));
        AdminAPI.getAllVMs()
            .then(response => {
                if (response.status === 200) {
                    setVMs(response.data);
                }
                else {
                    setVMMessage(response.message);
                }
            })
        AdminAPI.getBannedUsers()
            .then(response => {
                if (response.status === 200) {
                    setBannedUsers(response.data);
                }
                else {
                    console.error(response.message);
                }
            })
    }, []);

    const isUserBanned = (userId) => {
        return bannedUsers.some((bannedUser) => bannedUser.id === userId);
    };

    const filteredUsers = users.filter(user => {
        return user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) && !isUserBanned(user.id);
    });

    const filteredVMs = vms.filter(vm => {
        return vm.iso.toLowerCase().includes(vmSearchQuery.toLowerCase());
    });

    const filteredBannedUsers = bannedUsers.filter(user => {
        return user.username.toLowerCase().includes(userSearchQuery.toLowerCase());
    });

    const changeUsername = (id) => {
        if (newUsername.trim() === '') {
            setUsernameMessage('Username cannot be empty');
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
                setUsernameMessage('');
                window.location.reload();
            }
            else {
                setUsernameMessage(response.message);
            }
        }).catch(error => console.error(error));
    }

    const changeEmail = (id) => {
        if (newEmail.trim() === '') {
            setEmailMessage('Email cannot be empty');
            return;
        }

        if (!validator.isEmail(newEmail)) {
            setEmailMessage('Email is in an invalid format');
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
                setEmailMessage('');
                window.location.reload();
            }
            else {
                setEmailMessage(response.message);
            }
        }).catch(error => console.error(error));
    }

    const deleteUser = (id) => {
        AdminAPI.deleteUser(id)
            .then(response => {
                if (response.status === 200) {
                    // Update the users list
                    setUsers(users.filter(user => user.id !== id));
                    window.location.reload();
                }
                else {
                    setDeleteUserMessage(response.message);
                }
                setDeleteUserMessage('');
            })
            .catch(error => console.error(error));
    }

    const banUser = (id) => {
        AdminAPI.banUser(id, banReason)
            .then(response => {
                if (response.status === 200) {
                    // Update the users list
                    setUsers(users.filter(user => user.id !== id));
                    setBannedUsers(bannedUsers.concat(users.filter(user => user.id === id)));
                    window.location.reload();
                }
                else {
                    setBanMessage(response.message);
                }
                setBanMessage('');
            })
            .catch(error => console.error(error));
    }

    const unbanUser = (id) => {
        AdminAPI.unbanUser(id)
            .then(response => {
                if (response.status === 200) {
                    // Update the users list
                    setBannedUsers(bannedUsers.filter(user => user.id !== id));
                    window.location.reload();
                }
                else {
                    setUnbanMessage(response.message);
                }
                setUnbanMessage('');
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
                    setStopVMMessage(response.message);
                }
                setDeleteUserMessage('');
            })
            .catch(error => console.error(error));
    }

    return (
        // Map through all users and display their information in a Card
        <div>
            <Navbar />
            <div>
                <div className="container">
                    <h1>Admin</h1>
                    <Tabs
                        defaultActiveKey="users"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="users" title="Users">

                            <div className="container">
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
                                        // If the user is banned, don't display them
                                        // If the user is not banned, display them
                                        <div key={user.name} className="col-12 col-md-6 col-lg-4" style={{ paddingBottom: '1rem' }}>
                                            <div className="card">
                                                <div className="card-body">
                                                    <h5 className="card-title">{user.username}</h5>
                                                    <p className="card-text">Email: {user.email}</p>
                                                    <p className="card-text">Role: {user.role}</p>
                                                    <p className="card-text">ID: {user.id}</p>
                                                    {/* Format the date to a readable format, do not show if the user has never logged in */}
                                                    {user.login_time !== null &&
                                                        <p className="card-text">Last Login: {new Date(user.login_time).toLocaleString()} from {user.ip}</p>
                                                    }
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
                                                                    <button className="btn btn-danger" onClick={() => { setSelectedUser(user.id); setShowBanModal(true); }}>Ban user</button>
                                                                    :
                                                                    <button className="btn btn-secondary" disabled>Cannot ban admin</button>
                                                                }
                                                                {/* If the user is not an admin, allow the admin to delete the user */}
                                                                {user.role !== 'admin' ?
                                                                    <button className="btn btn-danger" onClick={() => { setSelectedUser(user.id); setShowDeleteUserModal(true); }}>Delete user</button>
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
                            </div>
                        </Tab>
                        <Tab eventKey="vms" title="Virtual Machines">
                            <div className="container">
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
                                        {vmMessage !== '' &&
                                            <div className="alert alert-primary" role="alert">
                                                {vmMessage}
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
                        </Tab>
                        <Tab eventKey="banned" title="Banned Users">
                            <div className="container">
                                <h2>Banned Users</h2>
                                <div className="row">
                                    <div className="col">
                                        <form className="form-inline">
                                            <input className="form-control mb-3" type="search" placeholder="Search" aria-label="Search" value={userSearchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                        </form>
                                    </div>
                                </div>
                                <div className="row">
                                    {filteredBannedUsers.map((user) => (
                                        <div key={user.name} className="col-12 col-md-6 col-lg-4" style={{ paddingBottom: '1rem' }}>
                                            <div className="card">
                                                <div className="card-body">
                                                    <h5 className="card-title">{user.username}</h5>
                                                    <p className="card-text">Email: {user.email}</p>
                                                    <p className='card-text'>Role: {user.role}</p>
                                                    <p className='card-text'>User ID: {user.user_id}</p>
                                                    <p className='card-text'>Last Login: {new Date(user.login_time).toLocaleString()} from {user.ip}</p>
                                                    <p className='card-text'>Reason: {user.ban_reason}</p>
                                                </div>
                                                <div className="card-footer">
                                                    <button className="btn btn-danger" onClick={() => { setSelectedUser(user.id); setShowUnbanModal(true); }}>Unban user</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
                {/* Delete user confirmation modal */}
                <Modal show={showDeleteUserModal} onHide={() => setShowDeleteUserModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this user?
                        {/* if message is not empty, display the error */}
                        {deleteUserMessage !== '' &&
                            <div className="alert alert-primary" role="alert" style={{ marginTop: '1rem' }}>
                                {deleteUserMessage}
                            </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        {/* If status code is 200, delete the user, else display the error */}

                        <button className="btn btn-danger" onClick={() => { deleteUser(selectedUser); setShowDeleteUserModal(false); }}>Delete</button>
                        <button className="btn btn-secondary" onClick={() => setShowDeleteUserModal(false)}>Cancel</button>
                    </Modal.Footer>
                </Modal>
                {/* Stop VM confirmation modal */}
                <Modal show={showStopVMModal} onHide={() => setShowStopVMModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to stop this VM?
                        {stopVMMessage !== '' &&
                            <div className="alert alert-primary" role="alert" style={{ marginTop: '1rem' }}>
                                {stopVMMessage}
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
                        {usernameMessage !== '' &&
                            <div className="alert alert-primary" role="alert" style={{ marginTop: '1rem' }}>
                                {usernameMessage}
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
                        {emailMessage !== '' &&
                            <div className="alert alert-primary" role="alert" style={{ marginTop: '1rem' }}>
                                {emailMessage}
                            </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={() => { changeEmail(selectedUser); setShowEmailModal(false); }}>Change</button>
                        <button className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                    </Modal.Footer>
                </Modal>
                {/* Ban user modal */}
                <Modal show={showBanModal} onHide={() => setShowBanModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ban User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Please enter a reason for banning this user.</p>
                        <input className="form-control" type="text" placeholder="Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
                        {banMessage !== '' &&
                            <div className="alert alert-primary" role="alert" style={{ marginTop: '1rem' }}>
                                {banMessage}
                            </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => { banUser(selectedUser); setShowBanModal(false); }}>Ban</button>
                        <button className="btn btn-secondary" onClick={() => setShowBanModal(false)}>Cancel</button>
                    </Modal.Footer>
                </Modal>
                {/* Unban user modal */}
                <Modal show={showUnbanModal} onHide={() => setShowUnbanModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Unban User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to unban this user?
                        {unbanMessage !== '' &&
                            <div className="alert alert-primary" role="alert" style={{ marginTop: '1rem' }}>
                                {unbanMessage}
                            </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => { unbanUser(selectedUser); setShowUnbanModal(false); }}>Unban</button>
                        <button className="btn btn-secondary" onClick={() => setShowUnbanModal(false)}>Cancel</button>
                    </Modal.Footer>
                </Modal>
            </div >

        </div>
    )
}

export default Admin;

