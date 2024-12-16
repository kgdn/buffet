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

import passwordValidator from "password-validator";
import { FC, ReactElement, useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Image,
  Modal,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import validator from "validator";

import {
  changeEmail,
  changePassword,
  changeUsername,
  deleteAccount,
  disableTwoFactorAuth,
  enableTwoFactorAuth,
  verifyTwoFactorAuth,
} from "../api/AccountsAPI";
import Footer from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";
import { AuthContext } from "../contexts/AuthContext";

const UserManagementScreen: FC = (): ReactElement => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigate = useNavigate();
  const schema = new passwordValidator();

  const [getEmail, setCurrentEmail] = useState("");
  const [getUserName, setCurrentUserName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showDisableTwoFactorModal, setShowDisableTwoFactorModal] = useState(false);
  const [requiresTwoFactorCode, setRequiresTwoFactorCode] = useState("");
  const [showUsernameChangeModal, setShowUsernameChangeModal] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  useEffect(() => {
    document.title = "Buffet - Manage User";
  }, []);

  const handleModalClose = () => {
    setShowDeleteModal(false);
    setShowTwoFactorModal(false);
    setShowDisableTwoFactorModal(false);
    setShowUsernameChangeModal(false);
    setShowEmailChangeModal(false);
    setShowPasswordChangeModal(false);
    setWarningMessage("");
  }

  const ChangeUsernameButton = () => {
    if (username.trim() === "" || currentPassword.trim() === "") {
      setWarningMessage("Username and password cannot be empty.");
      return;
    }

    // Username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces.
    if (!validator.matches(username, /^[a-zA-Z0-9_-]+$/)) {
      setWarningMessage(
        "Invalid username. Your username can only contain letters, numbers, underscores, and dashes. It cannot contain spaces."
      );
      return;
    }

    changeUsername(username, currentPassword, requiresTwoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setWarningMessage(response.message);
      }
    });
  };

  const ChangePasswordButton = () => {
    if (oldPassword.trim() === "" || newPassword.trim() === "") {
      setWarningMessage("Old password and new password cannot be empty.");
      return;
    }

    // Minimum length 8, maximum length 100, must have uppercase, must have lowercase, must have 2 digits, must not have spaces
    schema
      .is()
      .min(8)
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits(2)
      .has()
      .symbols()
      .not()
      .spaces();

    if (!schema.validate(newPassword)) {
      setWarningMessage(
        "Invalid password. Your password must be at least 8 characters long, have at least 1 uppercase letter, have at least 1 lowercase letter, have 1 symbol, have at least 2 digits, and must not have spaces."
      );
      return;
    }

    // If old password and new password are the same, return
    if (oldPassword === newPassword) {
      setWarningMessage("Old password and new password cannot be the same.");
      return;
    }

    changePassword(oldPassword, newPassword, requiresTwoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setWarningMessage(response.message);
      }
    });
  };

  const ChangeEmailButton = () => {
    if (email.trim() === "" || currentPassword.trim() === "") {
      setWarningMessage("Email and password cannot be empty.");
      return;
    }

    if (!validator.isEmail(email)) {
      setWarningMessage("Invalid email.");
      return;
    }

    changeEmail(email, currentPassword, requiresTwoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setWarningMessage(response.message);
      }
    });
  };

  const DeleteAccountButton = () => {
    if (currentPassword.trim() === "") {
      setWarningMessage("Password cannot be empty.");
      return;
    }

    deleteAccount(currentPassword, requiresTwoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate("/");
        navigate(0);
      }
      if (response.message === "Please provide the 2FA code") {
        setShowDeleteModal(false);
      } else {
        setWarningMessage(response.message);
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
        setWarningMessage(response.message);
      }
    });
  };

  const VerifyTwoFactorButton = async () => {
    verifyTwoFactorAuth(twoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setWarningMessage(response.message);
      }
    });
  };

  const DisableTwoFactorButton = async () => {
    // trim the password
    if (currentPassword.trim() === "") {
      setWarningMessage("Password cannot be empty.");
      return;
    }

    if (twoFactorCode.trim() === "") {
      setWarningMessage("Two-factor code cannot be empty.");
      return;
    }

    disableTwoFactorAuth(currentPassword, twoFactorCode).then((response) => {
      if (response.status === 200) {
        navigate(0);
      } else {
        setWarningMessage(response.message);
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
          </Col>
        </Row>
        <Row>
          <Col>
            <p>
              Your current username is <strong>{getUserName}</strong>.
            </p>
            <p>
              Your current email is <strong>{getEmail}</strong>.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowUsernameChangeModal(true)}
            >
              Change Username
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowEmailChangeModal(true)}
              className="ms-2"
            >
              Change Email
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowPasswordChangeModal(true)}
              className="ms-2"
            >
              Change Password
            </Button>
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
              variant={twoFactorEnabled ? "danger" : "primary"}
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

      {/* Change username modal */}
      <Modal show={showUsernameChangeModal} onHide={() => handleModalClose()} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Username</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              ChangeUsernameButton();
            }}
          >
            <Form.Group as={Row} controlId="formUsername" className="mb-2
            ">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="New Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Col>
            </Form.Group>
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
          {/* If two-factor authentication is enabled, show the two-factor code input */}
          {twoFactorEnabled ? (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                ChangeUsernameButton();
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
          ) : (
            <></>
          )}
          {warningMessage === "" ? (
            <></>
          ) : (
            <Alert variant="danger" role="alert">
              {warningMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={ChangeUsernameButton}>
            Change Username
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change email modal */}
      <Modal show={showEmailChangeModal} onHide={() => handleModalClose()} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              ChangeEmailButton();
            }}
          >
            <Form.Group as={Row} controlId="formEmail" className="mb-2">
              <Col>
                <Form.Control
                  type="email"
                  placeholder="New Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Col>
            </Form.Group>
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
          {/* If two-factor authentication is enabled, show the two-factor code input */}
          {twoFactorEnabled ? (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                ChangeEmailButton();
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
          ) : (
            <></>
          )}
          {warningMessage === "" ? (
            <></>
          ) : (
            <Alert variant="danger" role="alert">
              {warningMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={ChangeEmailButton}>
            Change Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change password modal */}
      <Modal show={showPasswordChangeModal} onHide={() => handleModalClose()} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              ChangePasswordButton();
            }}
          >
            <Form.Group as={Row} controlId="formOldPassword" className="mb-2">
              <Col>
                <Form.Control
                  type="password"
                  placeholder="Old Password"
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formNewPassword" className="mb-2">
              <Col>
                <Form.Control
                  type="password"
                  placeholder="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Col>
            </Form.Group>
          </Form>
          {/* If two-factor authentication is enabled, show the two-factor code input */}
          {twoFactorEnabled ? (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                ChangePasswordButton();
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
          ) : (
            <></>
          )}
          {warningMessage === "" ? (
            <></>
          ) : (
            <Alert variant="danger" role="alert">
              {warningMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={ChangePasswordButton}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete account modal */}
      <Modal show={showDeleteModal} onHide={() => handleModalClose()} centered>
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
          {/* If two-factor authentication is enabled, show the two-factor code input */}
          {twoFactorEnabled ? (
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
          ) : (
            <></>
          )}
          {warningMessage === "" ? (
            <></>
          ) : (
            <Alert variant="danger" role="alert">
              {warningMessage}
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
        onHide={() => handleModalClose()}
        centered>
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
              display: warningMessage === "" ? "none" : "block",
              marginTop: "1rem",
            }}
          >
            {warningMessage}
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
        onHide={() => handleModalClose()}
        centered>
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
              display: warningMessage === "" ? "none" : "block",
              marginTop: "1rem",
            }}
          >
            {warningMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={DisableTwoFactorButton}>
            Disable Two-Factor Authentication
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </div>
  );
};

export default UserManagementScreen;