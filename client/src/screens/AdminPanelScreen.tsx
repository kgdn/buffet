/*
 * Admin.tsx - Admin panel for the application.
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
import { FC, ReactElement, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import validator from "validator";

import {
  banUser,
  changeEmail,
  changeUsername,
  deleteUnverifiedUser,
  deleteUser,
  deleteVM,
  getAllUsers,
  getAllVMs,
  getBannedUsers,
  getUnverifiedUsers,
  unbanUser,
  verifyUser,
} from "../api/AdminAPI";
import Footer from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  login_time: string;
  ip: string;
}

interface UnverifiedUser {
  id: number;
  username: string;
  email: string;
}

interface BannedUser {
  user_id: string;
  username: string;
  email: string;
  ban_reason: string;
  login_time: string;
  ip: string;
}

interface VM {
  id: number;
  user_id: number;
  name: string;
  version: string;
  desktop: string;
  iso: string;
  port: number;
  wsport: number;
}

const AdminPanelScreen: FC = (): ReactElement => {
  /*
   * I have to admit, this is not the most elegant solution, but it works. I have to use multiple states for each modal,
   * because if I use one state for all modals, the modals will not work as expected. A better solution for state management would
   * be to use a state management library like Redux. I did not use Redux because I wasn't aware of it when I started this project,
   * and I didn't want to refactor the entire project to use Redux.
   */
  const [users, setUsers] = useState<User[]>([]);
  const [vms, setVMs] = useState<VM[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [userSearchQuery, setSearchQuery] = useState("");
  const [vmSearchQuery, setVmSearchQuery] = useState("");
  const [bannedUserSearchQuery, setBannedUserSearchQuery] = useState("");
  const [unverifiedUserSearchQuery, setUnverifiedUserSearchQuery] =
    useState("");
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showStopVMModal, setShowStopVMModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVM, setSelectedVM] = useState("");
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banMessage, setBanMessage] = useState("");
  const [vmMessage, setVMMessage] = useState("");
  const [unbanMessage, setUnbanMessage] = useState("");
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [bannedMessage, setBannedMessage] = useState("");
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [unverifiedMessage, setUnverifiedMessage] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [showDeleteUnverifiedModal, setShowDeleteUnverifiedModal] =
    useState(false);
  const [deleteUnverifiedMessage, setDeleteUnverifiedMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Buffet - Admin";
  }, []);

  // Get all users, VMs, banned users, unverified users, and logs
  useEffect(() => {
    // Get all users
    getAllUsers()
      .then((response) => {
        if (response.status === 200) {
          setUsers(response.data as User[]);
        }
      })
    // Get all VMs
    getAllVMs().then((response) => {
      if (response.status === 200) {
        setVMs(response.data as VM[]);
      } else {
        setVMMessage(response.message);
      }
    });
    // Get all banned users
    getBannedUsers().then((response) => {
      if (response.status === 200) {
        setBannedUsers(response.data as BannedUser[]);
      } else {
        setBannedMessage(response.message);
      }
    });
    // Get all unverified users
    getUnverifiedUsers().then((response) => {
      if (response.status === 200) {
        setUnverifiedUsers(response.data as UnverifiedUser[]);
      } else {
        setUnverifiedMessage(response.message);
      }
    });
  }, []);

  // Check if the user is banned
  const isUserBanned = (userId: string): boolean => {
    return (bannedUsers as { user_id: string }[]).some(
      (user) => user.user_id === userId
    );
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    return (
      user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) &&
      !isUserBanned(String(user.id))
    );
  });

  // Filter VMs
  const filteredVMs = vms.filter((vm) => {
    return vm.iso.toLowerCase().includes(vmSearchQuery.toLowerCase());
  });

  // Filter banned users
  const filteredBannedUsers = (bannedUsers as { username: string }[]).filter(
    (user) => {
      return user.username
        .toLowerCase()
        .includes(bannedUserSearchQuery.toLowerCase());
    }
  );

  // Filter unverified users
  const filteredUnverifiedUsers = (
    unverifiedUsers as { username: string }[]
  ).filter((user) => {
    return user.username
      .toLowerCase()
      .includes(unverifiedUserSearchQuery.toLowerCase());
  });

  // Change username of user with id
  const ChangeUsernameButton = (id: string) => {
    // Check if the username is empty
    if (newUsername.trim() === "") {
      setWarningMessage("Username cannot be empty");
      return;
    }

    // Check if the username is valid
    if (!validator.matches(newUsername, /^[a-zA-Z0-9_-]+$/)) {
      setWarningMessage(
        "Invalid username. Your username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces."
      );
      return;
    }

    // Change the username
    changeUsername(id, newUsername)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setWarningMessage(response.message);
        }
      })
  };

  // Change email of user with id
  const ChangeEmailButton = (id: string) => {
    // Check if the email is empty
    if (newEmail.trim() === "") {
      setWarningMessage("Email cannot be empty");
      return;
    }

    // Check if the email is in a valid format
    if (!validator.isEmail(newEmail)) {
      setWarningMessage("Email is in an invalid format");
      return;
    }

    // Change the email
    changeEmail(id, newEmail)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setWarningMessage(response.message);
        }
      })
  };

  // Delete user with id
  const DeleteUserButton = (id: string) => {
    deleteUser(id)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setWarningMessage(response.message);
        }
        setWarningMessage("");
      })
  };

  // Ban user with id
  const BanUserButton = (id: string) => {
    banUser(id, banReason)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setBanMessage(response.message);
        }
        setBanMessage("");
      })
  };

  // Unban user with id
  const UnbanUserButton = (id: string) => {
    unbanUser(id)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setUnbanMessage(response.message);
        }
        setUnbanMessage("");
      })

  };

  // Delete VM with id
  const DeleteVMButton = (id: string) => {
    deleteVM(id)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setWarningMessage(response.message);
        }
        setWarningMessage("");
      })

  };

  // Delete unverified user with id
  const VerifyUserButton = (id: string) => {
    verifyUser(id)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setVerifyMessage(response.message);
        }
        setVerifyMessage("");
      })
  };

  // Delete unverified user with id
  const DeleteUnverifiedUserButton = (id: string) => {
    deleteUnverifiedUser(id)
      .then((response) => {
        if (response.status === 200) {
          navigate(0);
        } else {
          setDeleteUnverifiedMessage(response.message);
        }
        setDeleteUnverifiedMessage("");
      })
  };

  const handleModalClose = () => {
    setShowBanModal(false);
    setShowDeleteUserModal(false);
    setShowStopVMModal(false);
    setShowUsernameModal(false);
    setShowEmailModal(false);
    setShowUnbanModal(false);
    setShowVerifyModal(false);
    setShowDeleteUnverifiedModal(false);
    setWarningMessage("");
  };

  return (
    <div id="admin" style={{ marginTop: "4rem" }}>
      <NavbarComponent />
      <Container>
        <h1>Admin Panel</h1>
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
                      <Form.Control
                        type="text"
                        placeholder="Search"
                        value={userSearchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
              <Row>
                {/* Make all cards the same size regardless of content */}
                {filteredUsers.map((user) => (
                  <Col
                    key={(user as { username: string }).username}
                    xs={12}
                    md={6}
                    lg={4}
                    style={{ paddingBottom: "1rem" }}
                  >
                    <Card style={{ height: "100%" }}>
                      <Card.Body>
                        <Card.Title>
                          {(user as { username: string }).username}
                        </Card.Title>
                        <Card.Text>
                          Email: {(user as { email: string }).email}
                        </Card.Text>
                        <Card.Text>
                          Role: {(user as { role: string }).role}
                        </Card.Text>
                        <Card.Text>
                          User ID: {(user as { id: number }).id}
                        </Card.Text>
                        {/* Format the date to a readable format, do not show if the user has never logged in */}
                        {(user as { login_time: string }).login_time !==
                          null && (
                            <Card.Text>
                              Last Login:{" "}
                              {new Date(
                                (user as { login_time: string }).login_time
                              ).toLocaleString()}{" "}
                              from {(user as { ip: string }).ip}
                            </Card.Text>
                          )}
                      </Card.Body>
                      <Card.Footer>
                        <Row style={{ paddingBottom: "1rem" }}>
                          <Col>
                            <ButtonGroup>
                              <Button
                                variant="primary"
                                onClick={() => {
                                  setSelectedUser(user.id.toString());
                                  setNewUsername(user.username);
                                  setShowUsernameModal(true);
                                }}
                              >
                                Change Username
                              </Button>
                              <Button
                                variant="primary"
                                onClick={() => {
                                  setSelectedUser(user.id.toString());
                                  setNewEmail(user.email);
                                  setShowEmailModal(true);
                                }}
                              >
                                Change Email
                              </Button>
                            </ButtonGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <ButtonGroup>
                              {/* If the user is not an admin, allow the admin to delete the user */}
                              {user.role !== "admin" ? (
                                <Button
                                  variant="danger"
                                  onClick={() => {
                                    setSelectedUser(user.id.toString());
                                    setShowBanModal(true);
                                  }}
                                >
                                  Ban user
                                </Button>
                              ) : (
                                <Button variant="secondary" disabled>
                                  Cannot ban admin
                                </Button>
                              )}
                              {/* If the user is not an admin, allow the admin to delete the user */}
                              {user.role !== "admin" ? (
                                <Button
                                  variant="danger"
                                  onClick={() => {
                                    setSelectedUser(user.id.toString());
                                    setShowDeleteUserModal(true);
                                  }}
                                >
                                  Delete user
                                </Button>
                              ) : (
                                <Button variant="secondary" disabled>
                                  Cannot delete admin
                                </Button>
                              )}
                              {/* If the user_id matches the user_id of the VM, show the delete VM button */}
                              {vms.filter((vm) => vm.user_id === user.id)
                                .length > 0 && (
                                  <Button
                                    variant="danger"
                                    onClick={() => {
                                      setSelectedVM(
                                        vms
                                          .filter(
                                            (vm) => vm.user_id === user.id
                                          )[0]
                                          .id.toString()
                                      );
                                      setShowStopVMModal(true);
                                    }}
                                  >
                                    Stop VM
                                  </Button>
                                )}
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
                    {vmMessage !== "" && (
                      <Alert variant="primary" role="alert" className="mb-3">
                        {vmMessage}
                      </Alert>
                    )}
                  </Form>
                </Col>
              </Row>
              <Row>
                {filteredVMs.map((vm) => (
                  <Col
                    key={vm.name}
                    xs={12}
                    md={6}
                    lg={4}
                    style={{ paddingBottom: "1rem" }}
                  >
                    <Card style={{ height: "100%" }}>
                      <Card.Body>
                        <Card.Title>
                          {vm.name} {vm.version} {vm.desktop} ({vm.iso})
                        </Card.Title>
                        <Card.Text>User ID: {vm.user_id}</Card.Text>
                        <Card.Text>VM ID: {vm.id}</Card.Text>
                        <Card.Text>Port: {vm.port}</Card.Text>
                        <Card.Text>Websocket Port: {vm.wsport}</Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setSelectedVM(vm.id.toString());
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
                      <Form.Control
                        type="text"
                        placeholder="Search"
                        value={bannedUserSearchQuery}
                        onChange={(e) =>
                          setBannedUserSearchQuery(e.target.value)
                        }
                      />
                    </Form.Group>
                    <Alert
                      variant="primary"
                      role="alert"
                      style={{
                        display: bannedUsers.length === 0 ? "block" : "none",
                      }}
                    >
                      {bannedMessage}
                    </Alert>
                  </Form>
                </Col>
              </Row>
              <Row>
                {filteredBannedUsers.map((user) => (
                  <Col
                    key={(user as { username: string }).username}
                    xs={12}
                    md={6}
                    lg={4}
                    style={{ paddingBottom: "1rem" }}
                  >
                    <Card style={{ height: "100%" }}>
                      <Card.Body>
                        <Card.Title>
                          {(user as { username: string }).username}
                        </Card.Title>
                        <Card.Text>
                          Email: {(user as unknown as { email: string }).email}
                        </Card.Text>
                        <Card.Text>
                          Role: {(user as unknown as { role: string }).role}
                        </Card.Text>
                        <Card.Text>
                          User ID:{" "}
                          {(user as unknown as { user_id: string }).user_id}
                        </Card.Text>
                        <Card.Text>
                          Reason:{" "}
                          {
                            (user as unknown as { ban_reason: string })
                              .ban_reason
                          }
                        </Card.Text>
                        {(user as unknown as { login_time: string })
                          .login_time !== null && (
                            <Card.Text>
                              Last Login:{" "}
                              {new Date(
                                (
                                  user as unknown as { login_time: string }
                                ).login_time
                              ).toLocaleString()}{" "}
                              from {(user as unknown as { ip: string }).ip}
                            </Card.Text>
                          )}
                      </Card.Body>
                      <Card.Footer>
                        <ButtonGroup>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedUser(
                                (user as unknown as { user_id: string }).user_id
                              );
                              setShowUnbanModal(true);
                            }}
                          >
                            Unban user
                          </Button>
                        </ButtonGroup>
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
                      <Form.Control
                        type="text"
                        placeholder="Search"
                        value={unverifiedUserSearchQuery}
                        onChange={(e) =>
                          setUnverifiedUserSearchQuery(e.target.value)
                        }
                      />
                    </Form.Group>
                    <Alert
                      variant="primary"
                      role="alert"
                      style={{
                        display:
                          unverifiedUsers.length === 0 ? "block" : "none",
                      }}
                    >
                      {unverifiedMessage}
                    </Alert>
                  </Form>
                </Col>
              </Row>
              <Row>
                {filteredUnverifiedUsers.map((user) => (
                  <Col
                    key={(user as { username: string }).username}
                    xs={12}
                    md={6}
                    lg={4}
                    style={{ paddingBottom: "1rem" }}
                  >
                    <Card style={{ height: "100%" }}>
                      <Card.Body>
                        <Card.Title>
                          {(user as { username: string }).username}
                        </Card.Title>
                        <Card.Text>
                          Email: {(user as unknown as { email: string }).email}
                        </Card.Text>
                        <Card.Text>
                          User ID: {(user as unknown as { id: number }).id}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <ButtonGroup>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedUser(
                                (
                                  user as unknown as { id: number }
                                ).id.toString()
                              );
                              setShowVerifyModal(true);
                            }}
                          >
                            Verify user
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              setSelectedUser(
                                (
                                  user as unknown as { id: number }
                                ).id.toString()
                              );
                              setShowDeleteUnverifiedModal(true);
                            }}
                          >
                            Delete user
                          </Button>
                        </ButtonGroup>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>
          </Tab>
        </Tabs>
        <Container>
          {/* Delete user confirmation modal */}
          <Modal
            show={showDeleteUserModal}
            onHide={() => handleModalClose()}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this user?
              {/* if message is not empty, display the error */}
              {warningMessage !== "" && (
                <Alert variant="primary" role="alert">
                  {warningMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              {/* If status code is 200, delete the user, else display the error */}
              <ButtonGroup>
                <Button
                  variant="danger"
                  onClick={() => {
                    DeleteUserButton(selectedUser);
                    handleModalClose();
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* Stop VM confirmation modal */}
          <Modal
            show={showStopVMModal}
            onHide={() => handleModalClose()}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to stop this VM?
              {warningMessage !== "" && (
                <Alert variant="primary" role="alert">
                  {warningMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="danger"
                  onClick={() => {
                    DeleteVMButton(selectedVM);
                    handleModalClose();
                  }}
                >
                  Stop
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* New username modal */}
          <Modal
            show={showUsernameModal}
            onHide={() => handleModalClose()}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Change Username</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  ChangeUsernameButton(selectedUser);
                }}
              >
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="New Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </Form.Group>
              </Form>
              {warningMessage !== "" && (
                <Alert variant="primary" role="alert">
                  {warningMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="primary"
                  onClick={() => {
                    ChangeUsernameButton(selectedUser);
                  }}
                >
                  Change
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* New email modal */}
          <Modal show={showEmailModal} onHide={() => handleModalClose()} centered>
            <Modal.Header closeButton>
              <Modal.Title>Change Email</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  ChangeEmailButton(selectedUser);
                }}
              >
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="New Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </Form.Group>
              </Form>
              {warningMessage !== "" && (
                <Alert
                  variant="primary"
                  role="alert"
                  style={{ marginTop: "1rem" }}
                >
                  {warningMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="primary"
                  onClick={() => {
                    ChangeEmailButton(selectedUser);
                  }}
                >
                  Change
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* Ban user modal */}
          <Modal show={showBanModal} onHide={() => handleModalClose()} centered>
            <Modal.Header closeButton>
              <Modal.Title>Ban User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Please enter a reason for banning this user.</p>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  BanUserButton(selectedUser);
                  handleModalClose();
                }}
              >
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Reason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </Form.Group>
              </Form>
              {banMessage !== "" && (
                <Alert
                  variant="primary"
                  role="alert"
                  style={{ marginTop: "1rem" }}
                >
                  {banMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="danger"
                  onClick={() => {
                    BanUserButton(selectedUser);
                    handleModalClose();
                  }}
                >
                  Ban
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* Unban user modal */}
          <Modal show={showUnbanModal} onHide={() => handleModalClose()} centered>
            <Modal.Header closeButton>
              <Modal.Title>Unban User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to unban this user?
              {unbanMessage !== "" && (
                <Alert
                  variant="primary"
                  role="alert"
                  style={{ marginTop: "1rem" }}
                >
                  {unbanMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="danger"
                  onClick={() => {
                    UnbanUserButton(selectedUser);
                    handleModalClose();
                  }}
                >
                  Unban
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* Verify user modal */}
          <Modal
            show={showVerifyModal}
            onHide={() => handleModalClose()}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Verify User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to verify this user?
              {verifyMessage !== "" && (
                <Alert
                  variant="primary"
                  role="alert"
                  style={{ marginTop: "1rem" }}
                >
                  {verifyMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="primary"
                  onClick={() => {
                    VerifyUserButton(selectedUser);
                    handleModalClose();
                  }}
                >
                  Verify
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>

          {/* Delete unverified user modal */}
          <Modal
            show={showDeleteUnverifiedModal}
            onHide={() => handleModalClose()}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this user?
              {deleteUnverifiedMessage !== "" && (
                <Alert
                  variant="primary"
                  role="alert"
                  style={{ marginTop: "1rem" }}
                >
                  {deleteUnverifiedMessage}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button
                  variant="danger"
                  onClick={() => {
                    DeleteUnverifiedUserButton(selectedUser);
                    handleModalClose();
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>
        </Container>
      </Container>
      <Footer />
    </div>
  );
};

export default AdminPanelScreen;
