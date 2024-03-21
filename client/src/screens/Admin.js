import React, { useEffect, useState, Fragment } from 'react';
import NavbarComponent from '../components/Navbar';
import AdminAPI from '../api/AdminAPI';
import validator from 'validator';
import { Alert, Container, Col, Row, Button, Form, ButtonGroup, Modal, Tab, Table, Tabs, Card } from 'react-bootstrap';
import Footer from '../components/Footer';

function Admin() {
	/* 
	 * I have to admit, this is not the most elegant solution, but it works. I have to use multiple states for each modal, 
	 * because if I use one state for all modals, the modals will not work as expected. A better solution for state management would 
	 * be to use a state management library like Redux. I did not use Redux because I wasn't aware of it when I started this project, 
	 * and I didn't want to refactor the entire project to use Redux. 
	 */
	const [users, setUsers] = useState([]);
	const [vms, setVMs] = useState([]);
	const [newUsername, setNewUsername] = useState('');
	const [newEmail, setNewEmail] = useState('');
	const [userSearchQuery, setSearchQuery] = useState('');
	const [vmSearchQuery, setVmSearchQuery] = useState('');
	const [bannedUserSearchQuery, setBannedUserSearchQuery] = useState('');
	const [unverifiedUserSearchQuery, setUnverifiedUserSearchQuery] = useState('');
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
	const [bannedMessage, setBannedMessage] = useState('');
	const [unverifiedUsers, setUnverifiedUsers] = useState([]);
	const [unverifiedMessage, setUnverifiedMessage] = useState('');
	const [showVerifyModal, setShowVerifyModal] = useState(false);
	const [verifyMessage, setVerifyMessage] = useState('');
	const [showDeleteUnverifiedModal, setShowDeleteUnverifiedModal] = useState(false);
	const [deleteUnverifiedMessage, setDeleteUnverifiedMessage] = useState('');
	const [logs, setLogs] = useState([]);

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
					setBannedMessage(response.message);
				}
			})
		AdminAPI.getUnverifiedUsers()
			.then(response => {
				if (response.status === 200) {
					setUnverifiedUsers(response.data);
				}
				else {
					setUnverifiedMessage(response.message);
				}
			})
		AdminAPI.getLogs().then(response => {
			if (response.status === 200) {
				setLogs(response.data);
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
		return user.username.toLowerCase().includes(bannedUserSearchQuery.toLowerCase());
	});

	const filteredUnverifiedUsers = unverifiedUsers.filter(user => {
		return user.username.toLowerCase().includes(unverifiedUserSearchQuery.toLowerCase());
	});

	const changeUsername = (id) => {
		if (newUsername.trim() === '') {
			setUsernameMessage('Username cannot be empty');
			return;
		}

		if (!validator.matches(newUsername, /^[a-zA-Z0-9_-]+$/)) {
			setUsernameMessage('Invalid username. Your username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.');
			return;
		}

		AdminAPI.changeUsername(id, newUsername)
			.then(response => {
				if (response.status === 200) {
					window.location.reload();
				} else {
					setUsernameMessage(response.message);
				}
			})
			.catch(error => console.error(error));
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


		AdminAPI.changeEmail(id, newEmail)
			.then(response => {
				if (response.status === 200) {
					window.location.reload();
				} else {
					setEmailMessage(response.message);
				}
			})
			.catch(error => console.error(error));
	}

	const deleteUser = (id) => {
		AdminAPI.deleteUser(id)
			.then(response => {
				if (response.status === 200) {
					window.location.reload();
				} else {
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
					window.location.reload();
				} else {
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
					window.location.reload();
				} else {
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
					window.location.reload();
				} else {
					setStopVMMessage(response.message);
				}
				setDeleteUserMessage('');
			})
			.catch(error => console.error(error));
	}

	const verifyUser = (id) => {
		AdminAPI.verifyUser(id)
			.then(response => {
				if (response.status === 200) {
					window.location.reload();
				} else {
					setVerifyMessage(response.message);
				}
				setVerifyMessage('');
			})
			.catch(error => console.error(error));
	}

	const deleteUnverifiedUser = (id) => {
		AdminAPI.deleteUser(id)
			.then(response => {
				if (response.status === 200) {
					window.location.reload();
				} else {
					setDeleteUnverifiedMessage(response.message);
				}
				setDeleteUnverifiedMessage('');
			})
			.catch(error => console.error(error));
	}

	const parseCefLog = (log) => {
		// Parse the date, action, message, severity and user from the log - remove dell-inspiron and CEF:0 from date
		const date = log.split('|')[0].split(' ').slice(0, 3).join(' ');
		const action = log.split('|')[4];
		const message = log.split('|')[5];
		const severity = log.split('|')[6];
		const user = log.split(' ')[log.split(' ').length - 1].split('=')[1];
		return { date, action, message, severity, user };
	}

	return (
		<div id="admin">
			<NavbarComponent />
			<Container>
				<h1>Admin</h1>
				<Tabs
					defaultActiveKey="users"
					id="uncontrolled-tab-example"
					className="mb-3"
				>
					<Tab eventKey="users" title="Users">
						<Container>
							<h2>Users</h2>
							<Row>
								<Col>
									<Form>
										<Form.Group className="mb-3">
											<Form.Control type="text" placeholder="Search" value={userSearchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
										</Form.Group>
									</Form>
								</Col>
							</Row>
							<Row>
								{/* Make all cards the same size regardless of content */}
								{filteredUsers.map((user) => (
									<Col key={user.name} xs={12} md={6} lg={4} style={{ paddingBottom: '1rem' }}>
										<Card style={{ height: '100%' }}>
											<Card.Body>
												<Card.Title>{user.username}</Card.Title>
												<Card.Text>Email: {user.email}</Card.Text>
												<Card.Text>Role: {user.role}</Card.Text>
												<Card.Text>ID: {user.id}</Card.Text>
												{/* Format the date to a readable format, do not show if the user has never logged in */}
												{user.login_time !== null &&
													<Card.Text>Last Login: {new Date(user.login_time).toLocaleString()} from {user.ip}</Card.Text>
												}
											</Card.Body>
											<Card.Footer>
												<Row style={{ paddingBottom: '1rem' }}>
													<Col>
														<ButtonGroup>
															<Button variant="primary" onClick={() => { setSelectedUser(user.id); setNewUsername(user.username); setShowUsernameModal(true); }}>Change Username</Button>
															<Button variant="primary" onClick={() => { setSelectedUser(user.id); setNewEmail(user.email); setShowEmailModal(true); }}>Change Email</Button>
														</ButtonGroup>
													</Col>
												</Row>
												<Row>
													<Col>
														<ButtonGroup>
															{/* If the user is not an admin, allow the admin to delete the user */}
															{user.role !== 'admin' ?
																<Button variant="danger" onClick={() => { setSelectedUser(user.id); setShowBanModal(true); }}>Ban user</Button>
																:
																<Button variant="secondary" disabled>Cannot ban admin</Button>
															}
															{/* If the user is not an admin, allow the admin to delete the user */}
															{user.role !== 'admin' ?
																<Button variant="danger" onClick={() => { setSelectedUser(user.id); setShowDeleteUserModal(true); }}>Delete user</Button>
																:
																<Button variant="secondary" disabled>Cannot delete admin</Button>
															}
															{/* If the user_id matches the user_id of the VM, show the delete VM button */}
															{vms.filter(vm => vm.user_id === user.id).length > 0 &&
																<Button variant="danger" onClick={() => { setSelectedVM(vms.filter(vm => vm.user_id === user.id)[0].id); setShowStopVMModal(true); }}>Stop VM</Button>
															}
														</ButtonGroup>
													</Col>
												</Row>
											</Card.Footer>
										</Card>
									</Col>
								))}
							</Row>
						</Container>
					</Tab>
					<Tab eventKey="vms" title="VMs">
						<Container>
							<h2>VMs</h2>
							<Row>
								<Col>
									<Form>
										<Form.Group className="mb-3">
											<Form.Control
												type="text"
												placeholder="Search"
												value={vmSearchQuery}
												onChange={(e) => setVmSearchQuery(e.target.value)}
											/>
										</Form.Group>
										{vmMessage !== '' && (
											<Alert variant="primary" role="alert" className="mb-3">
												{vmMessage}
											</Alert>
										)}
									</Form>
								</Col>
							</Row>
							<Row>
								{filteredVMs.map((vm) => (
									<Col key={vm.name} xs={12} md={6} lg={4} style={{ paddingBottom: '1rem' }}>
										<Card style={{ height: '100%' }}>
											<Card.Body>
												<Card.Title>{vm.name} {vm.version} {vm.desktop} ({vm.iso})</Card.Title>
												<Card.Text>User ID: {vm.user_id}</Card.Text>
												<Card.Text>VM ID: {vm.id}</Card.Text>
												<Card.Text>Port: {vm.port}</Card.Text>
												<Card.Text>Websocket Port: {vm.wsport}</Card.Text>
											</Card.Body>
											<Card.Footer>
												<Button
													variant="danger"
													onClick={() => {
														setSelectedVM(vm.id);
														setShowStopVMModal(true);
													}}
												>
													Stop VM
												</Button>
											</Card.Footer>
										</Card>
									</Col>
								))}
							</Row>
						</Container>
					</Tab>
					<Tab eventKey="banned" title="Banned Users">
						<Container>
							<h2>Banned Users</h2>
							<Row>
								<Col>
									<Form>
										<Form.Group className="mb-3">
											<Form.Control type="text" placeholder="Search" value={bannedUserSearchQuery} onChange={(e) => setBannedUserSearchQuery(e.target.value)} />
										</Form.Group>
										<Alert variant="primary" role="alert" style={{ display: bannedUsers.length === 0 ? 'block' : 'none' }}>
											{bannedMessage}
										</Alert>
									</Form>
								</Col>
							</Row>
							<Row>
								{filteredBannedUsers.map((user) => (
									<Col key={user.name} xs={12} md={6} lg={4} style={{ paddingBottom: '1rem' }}>
										<Card style={{ height: '100%' }}>
											<Card.Body>
												<Card.Title>{user.username}</Card.Title>
												<Card.Text>Email: {user.email}</Card.Text>
												<Card.Text>Role: {user.role}</Card.Text>
												<Card.Text>User ID: {user.user_id}</Card.Text>
												{user.login_time !== null &&
													<Card.Text>Last Login: {new Date(user.login_time).toLocaleString()} from {user.ip}</Card.Text>
												}
												<Card.Text>Reason: {user.ban_reason}</Card.Text>
											</Card.Body>
											<Card.Footer>
												<Button variant="danger" onClick={() => { setSelectedUser(user.id); setShowUnbanModal(true); }}>Unban user</Button>
											</Card.Footer>
										</Card>
									</Col>
								))}
							</Row>
						</Container>
					</Tab>
					<Tab eventKey="unverified" title="Unverified Users">
						<Container>
							<h2>Unverified Users</h2>
							<Row>
								<Col>
									<Form>
										<Form.Group className="mb-3">
											<Form.Control type="text" placeholder="Search" value={unverifiedUserSearchQuery} onChange={(e) => setUnverifiedUserSearchQuery(e.target.value)} />
										</Form.Group>
										<Alert variant="primary" role="alert" style={{ display: unverifiedUsers.length === 0 ? 'block' : 'none' }}>
											{unverifiedMessage}
										</Alert>
									</Form>
								</Col>
							</Row>
							<Row>
								{filteredUnverifiedUsers.map((user) => (
									<Col key={user.name} xs={12} md={6} lg={4} style={{ paddingBottom: '1rem' }}>
										<Card style={{ height: '100%' }}>
											<Card.Body>
												<Card.Title>{user.username}</Card.Title>
												<Card.Text>Email: {user.email}</Card.Text>
												<Card.Text>User ID: {user.id}</Card.Text>
											</Card.Body>
											<Card.Footer>
												<ButtonGroup>
													<Button variant="primary" onClick={() => { setSelectedUser(user.id); setShowVerifyModal(true); }}>Verify user</Button>
													<Button variant="danger" onClick={() => { setSelectedUser(user.id); setShowDeleteUnverifiedModal(true); }}>Delete user</Button>
												</ButtonGroup>
											</Card.Footer>
										</Card>
									</Col>
								))}
							</Row>
						</Container>
					</Tab>
					<Tab eventKey="logs" title="Logs">
						<Container>
							<h2>Logs</h2>
							<Row>
								<Col>
									<Form>
										<Form.Group className="mb-3">
											<Form.Control type="text" placeholder="Search" value={userSearchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
										</Form.Group>

									</Form>
								</Col>
							</Row>
							<Row>
								<Col>
									{Object.keys(logs)
										.sort((a, b) => new Date(b) - new Date(a))
										.map((date) => {
											return (
												<Fragment key={date}>
													<h3>{date}</h3>
													{/* Rounded corners, striped, bordered, hover effect, small table */}
													<Table striped bordered hover>
														<thead>
															<tr>
																<th>Date</th>
																<th>Action</th>
																<th>Message</th>
																<th>Severity</th>
																<th>User</th>
															</tr>
														</thead>
														<tbody>
															{/* sort by newest logs first */}
															{logs[date].map((log, index) => {
																const parsedLog = parseCefLog(log);
																return (
																	<tr key={index}>
																		<td>{parsedLog.date}</td>
																		<td>{parsedLog.action}</td>
																		<td>{parsedLog.message}</td>
																		<td>{parsedLog.severity}</td>
																		<td>{parsedLog.user}</td>
																	</tr>
																);
															}).reverse()}
														</tbody>
													</Table>
												</Fragment>
											);
										})}
								</Col>
							</Row>
						</Container>
					</Tab>
				</Tabs>
				<Container>
					{/* Delete user confirmation modal */}
					<Modal show={showDeleteUserModal} onHide={() => setShowDeleteUserModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Confirm Deletion</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Are you sure you want to delete this user?
							{/* if message is not empty, display the error */}
							{deleteUserMessage !== '' && (
								<Alert variant="primary" role="alert">
									{deleteUserMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							{/* If status code is 200, delete the user, else display the error */}
							<Button variant="danger" onClick={() => { deleteUser(selectedUser); setShowDeleteUserModal(false); }}>Delete</Button>
							<Button variant="secondary" onClick={() => setShowDeleteUserModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* Stop VM confirmation modal */}
					<Modal show={showStopVMModal} onHide={() => setShowStopVMModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Confirm Deletion</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Are you sure you want to stop this VM?
							{stopVMMessage !== '' && (
								<Alert variant="primary" role="alert">
									{stopVMMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="danger" onClick={() => { deleteVM(selectedVM); setShowStopVMModal(false); }}>Stop</Button>
							<Button variant="secondary" onClick={() => setShowStopVMModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* New username modal */}
					<Modal show={showUsernameModal} onHide={() => setShowUsernameModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Change Username</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form>
								<Form.Group className="mb-3">
									<Form.Control type="text" placeholder="New Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
								</Form.Group>
							</Form>
							{usernameMessage !== '' && (
								<Alert variant="primary" role="alert">
									{usernameMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="primary" onClick={() => { changeUsername(selectedUser); setShowUsernameModal(false); }}>Change</Button>
							<Button variant="secondary" onClick={() => setShowUsernameModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* New email modal */}
					<Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Change Email</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form>
								<Form.Group className="mb-3">
									<Form.Control type="text" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
								</Form.Group>
							</Form>
							{emailMessage !== '' && (
								<Alert variant="primary" role="alert" style={{ marginTop: '1rem' }}>
									{emailMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="primary" onClick={() => { changeEmail(selectedUser); setShowEmailModal(false); }}>Change</Button>
							<Button variant="secondary" onClick={() => setShowEmailModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* Ban user modal */}
					<Modal show={showBanModal} onHide={() => setShowBanModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Ban User</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>Please enter a reason for banning this user.</p>
							<Form>
								<Form.Group className="mb-3">
									<Form.Control type="text" placeholder="Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
								</Form.Group>
							</Form>
							{banMessage !== '' && (
								<Alert variant="primary" role="alert" style={{ marginTop: '1rem' }}>
									{banMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="danger" onClick={() => { banUser(selectedUser); setShowBanModal(false); }}>Ban</Button>
							<Button variant="secondary" onClick={() => setShowBanModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* Unban user modal */}
					<Modal show={showUnbanModal} onHide={() => setShowUnbanModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Unban User</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Are you sure you want to unban this user?
							{unbanMessage !== '' && (
								<Alert variant="primary" role="alert" style={{ marginTop: '1rem' }}>
									{unbanMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="danger" onClick={() => { unbanUser(selectedUser); setShowUnbanModal(false); }}>Unban</Button>
							<Button variant="secondary" onClick={() => setShowUnbanModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* Verify user modal */}
					<Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Verify User</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Are you sure you want to verify this user?
							{verifyMessage !== '' && (
								<Alert variant="primary" role="alert" style={{ marginTop: '1rem' }}>
									{verifyMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="primary" onClick={() => { verifyUser(selectedUser); setShowVerifyModal(false); }}>Verify</Button>
							<Button variant="secondary" onClick={() => setShowVerifyModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>

					{/* Delete unverified user modal */}
					<Modal show={showDeleteUnverifiedModal} onHide={() => setShowDeleteUnverifiedModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Delete User</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Are you sure you want to delete this user?
							{deleteUnverifiedMessage !== '' && (
								<Alert variant="primary" role="alert" style={{ marginTop: '1rem' }}>
									{deleteUnverifiedMessage}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="danger" onClick={() => { deleteUnverifiedUser(selectedUser); setShowDeleteUnverifiedModal(false); }}>Delete</Button>
							<Button variant="secondary" onClick={() => setShowDeleteUnverifiedModal(false)}>Cancel</Button>
						</Modal.Footer>
					</Modal>
				</Container>
			</Container>
			<Footer />
		</div >
	)
}

export default Admin;

