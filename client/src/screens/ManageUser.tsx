/*
 * ManageUser.tsx - Account management screen for the application.
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

import React, { useState, useEffect, useContext } from "react";
import NavbarComponent from "../components/Navbar";
import {
  Modal,
  Form,
  Button,
  ButtonGroup,
  Container,
  Row,
  Col,
  Alert,
  Image,
} from "react-bootstrap";
import {
  changeUsername,
  changePassword,
  changeEmail,
  deleteAccount,
  enableTwoFactorAuth,
  verifyTwoFactorAuth,
  disableTwoFactorAuth,
} from "../api/AccountsAPI";
import validator from "validator";
import passwordValidator from "password-validator";
import Footer from "../components/Footer";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const VirtualMachineView: React.FC = (): React.ReactElement => {
  const { user } = useContext(AuthContext);
  const [getEmail, setCurrentEmail] = useState("");
  const [getUserName, setCurrentUserName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pageMessage, setMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showDisableTwoFactorModal, setShowDisableTwoFactorModal] =
    useState(false);
  const [
    showDeleteRequiresTwoFactorModal,
    setShowDeleteRequiresTwoFactorModal,
  ] = useState(false);
  const [requiresTwoFactorCode, setRequiresTwoFactorCode] = useState("");
  const schema = new passwordValidator();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Buffet - Manage User";
  }, []);

  const ChangeUsernameButton = () => {
    if (username.trim() === "" || currentPassword.trim() === "") {
      setMessage("Username and password cannot be empty.");
      return;
    }

    // Username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.
    if (!validator.matches(username, /^[a-zA-Z0-9_-]+$/)) {
      setMessage(
        "Invalid username. Your username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces."
      );
      return;
    }

    changeUsername(username, currentPassword).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setMessage(response.message);
      }
    });
  };

  const ChangePasswordButton = () => {
    if (oldPassword.trim() === "" || newPassword.trim() === "") {
      setMessage("Old password and new password cannot be empty.");
      return;
    }

    // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
    schema
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits(2)
      .has()
      .not()
      .spaces()
      .has().symbols;

    if (!schema.validate(newPassword)) {
      setMessage(
        "Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces."
      );
      return;
    }

    // If old password and new password are the same, return
    if (oldPassword === newPassword) {
      setMessage("Old password and new password cannot be the same.");
      return;
    }

    changePassword(oldPassword, newPassword).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setMessage(response.message);
      }
    });
  };

  const ChangeEmailButton = () => {
    if (email.trim() === "" || currentPassword.trim() === "") {
      setMessage("Email and password cannot be empty.");
      return;
    }

    if (!validator.isEmail(email)) {
      setMessage("Invalid email.");
      return;
    }

    changeEmail(email, currentPassword).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setMessage(response.message);
      }
    });
  };

  const DeleteAccountButton = () => {
    if (currentPassword.trim() === "") {
      setDeleteMessage("Password cannot be empty.");
      return;
    }

    deleteAccount(currentPassword, requiresTwoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate("/");
        navigate(0);
      }
      if (response.message === "Please provide the 2FA code") {
        setShowDeleteModal(false);
        setShowDeleteRequiresTwoFactorModal(true);
      } else {
        setDeleteMessage(response.message);
      }
    });
  };

  const decodeBase64 = (input: string) => {
    return `data:image/png;base64,${input}`;
  };

  const EnableTwoFactorButton = async () => {
    enableTwoFactorAuth().then((response) => {
      if (response.status === 200) {
        setQrCode((response.data as { qr_code: string }).qr_code);
        setShowTwoFactorModal(true);
      } else {
        setTwoFactorMessage(response.message);
      }
    });
  };

  const VerifyTwoFactorButton = async () => {
    verifyTwoFactorAuth(twoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setTwoFactorMessage(response.message);
      }
    });
  };

  const DisableTwoFactorButton = async () => {
    // trim the password
    if (currentPassword.trim() === "") {
      setTwoFactorMessage("Password cannot be empty.");
      return;
    }

    disableTwoFactorAuth(currentPassword).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setTwoFactorMessage(response.message);
      }
    });
  };

  useEffect(() => {
    if (user) {
      setCurrentEmail(user.email);
      setCurrentUserName(user.username);
      setTwoFactorEnabled(user.two_factor_enabled);
    }
  }, [user]);

  return (
    <div id="manage-user" style={{ marginTop: "4rem" }}>
      <NavbarComponent />
      <Container>
        <Row>
          <Col>
            <h1>Manage User</h1>
            <Alert variant="info" className="mt-3">
              <Alert.Heading>Rules for usernames and passwords</Alert.Heading>
              <hr />
              <ul>
                <li>
                  Usernames can only contain letters, numbers, underscores, and
                  dashes. It cannot contain spaces.
                </li>
                <li>
                  Passwords must be at least 8 characters long, have at least 1
                  uppercase letter, have at least 1 lowercase letter, have 1
                  symbol, have at least 2 digits, and must not have spaces.
                </li>
              </ul>
            </Alert>
            <Row>
              <Col>
                {pageMessage === "" ? (
                  <></>
                ) : (
                  <Alert variant="danger" role="alert">
                    {pageMessage}
                  </Alert>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Change Username/Email</h2>
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder={getUserName}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder={getEmail}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Password (required for changes)"
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </Form.Group>
              <ButtonGroup>
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
            <h2 className="mt-3">Change Password</h2>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                ChangePasswordButton();
              }}
            >
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Old Password"
                  onChange={(event) => setOldPassword(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="New Password"
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={ChangePasswordButton}>
                Change Password
              </Button>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2 className="mt-3">Two-Factor Authentication</h2>
            <p>
              Two-factor authentication is currently{" "}
              {twoFactorEnabled ? "enabled" : "disabled"}.
            </p>
            <Button
              variant="primary"
              onClick={
                twoFactorEnabled
                  ? () => setShowDisableTwoFactorModal(true)
                  : EnableTwoFactorButton
              }
            >
              {twoFactorEnabled ? "Disable" : "Enable"} Two-Factor
              Authentication
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2 className="mt-3">Delete Account</h2>
            <p>
              Deleting your account will permanently remove all of your data
              from the system.
            </p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Delete account modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete your account?</p>
          <p className="text-danger">This action cannot be undone.</p>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              DeleteAccountButton();
            }}
          >
            <Form.Group as={Row} controlId="formPassword" className="mb-2">
              <Col>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Col>
            </Form.Group>
          </Form>
          {deleteMessage === "" ? (
            <></>
          ) : (
            <Alert variant="danger" role="alert">
              {deleteMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={DeleteAccountButton}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Two-factor authentication modals */}
      <Modal
        show={showTwoFactorModal}
        onHide={() => setShowTwoFactorModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Enable Two-Factor Authentication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Scan the QR code below with your two-factor authentication app to
            enable two-factor authentication.
          </p>
          <Image
            src={decodeBase64(qrCode)}
            alt="QR Code"
            rounded
            fluid
            className="mb-3 mt-3"
          />
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              VerifyTwoFactorButton();
            }}
          >
            <Form.Group as={Row} controlId="formTwoFactorCode" className="mb-2">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Two-factor code"
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                />
              </Col>
            </Form.Group>
          </Form>
          <Alert
            variant="danger"
            style={{
              display: twoFactorMessage === "" ? "none" : "block",
              marginTop: "1rem",
            }}
          >
            {twoFactorMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={VerifyTwoFactorButton}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Disable two-factor authentication modal */}
      <Modal
        show={showDisableTwoFactorModal}
        onHide={() => setShowDisableTwoFactorModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Disable Two-Factor Authentication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to disable two-factor authentication?</p>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              DisableTwoFactorButton();
            }}
          >
            <Form.Group as={Row} controlId="formPassword" className="mb-2">
              <Col>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Col>
            </Form.Group>
          </Form>
          <Alert
            variant="danger"
            style={{
              display: twoFactorMessage === "" ? "none" : "block",
              marginTop: "1rem",
            }}
          >
            {twoFactorMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={DisableTwoFactorButton}>
            Disable Two-Factor Authentication
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete account requires two-factor authentication modal */}
      <Modal
        show={showDeleteRequiresTwoFactorModal}
        onHide={() => setShowDeleteRequiresTwoFactorModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Two-factor authentication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Enter the two-factor authentication code from your authenticator
            app.
          </p>
          <p className="text-danger">
            Deleting your account requires two-factor authentication. Please
            enter the code below.
          </p>
          <Alert
            variant="danger"
            style={{
              display: deleteMessage === "" ? "none" : "block",
              marginTop: "1rem",
            }}
          >
            {deleteMessage}
          </Alert>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              DeleteAccountButton();
            }}
          >
            <Form.Group as={Row} controlId="formTwoFactorCode" className="mb-2">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Two-factor code"
                  onChange={(e) => setRequiresTwoFactorCode(e.target.value)}
                />
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={DeleteAccountButton}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </div>
  );
};

export default VirtualMachineView;
