/*
 * Navbar.tsx - Navbar component for the application.
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

import React, { useContext } from "react";
import {
  Container,
  Navbar,
  Nav,
  NavDropdown,
  Modal,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/logo.svg";
import { AuthContext } from "../contexts/AuthContext";

const NavbarComponent: React.FC = (): React.ReactElement => {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <div id="navbar">
      <Navbar
        bg={import.meta.env.DEV ? "danger" : "dark"}
        variant={import.meta.env.DEV ? "danger" : "dark"}
        expand="lg"
        className="mb-3"
        style={{
          boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
        }}
        fixed="top"
      >
        <Container>
          {/* display development warning if in development mode */}
          <Navbar.Brand href="/">
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              style={{ marginRight: "10px" }}
            />
            {import.meta.env.DEV ? "Buffet (Development)" : "Buffet"}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="https://github.com/kgdn/buffet">
                <i
                  className="bi bi-github"
                  style={{ color: "white", marginRight: "5px" }}
                ></i>
                GitHub
              </Nav.Link>
              <Nav.Link href="https://kgdn.xyz">
                <i
                  className="bi bi-globe"
                  style={{ color: "white", marginRight: "5px" }}
                ></i>
                kgdn.xyz
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
            {user ? (
              <Nav>
                <NavDropdown
                  title={user.username}
                  id="basic-nav-dropdown"
                  menuVariant="dark"
                >
                  <NavDropdown.Item href="/account">
                    Manage Account
                  </NavDropdown.Item>
                  {user.role === "admin" ? ( // If user is an admin, show the admin panel link
                    <NavDropdown.Item href="/admin">
                      Admin Panel
                    </NavDropdown.Item>
                  ) : null}
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            ) : (
              <Nav>
                <Nav.Link href="/login">Login</Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Are you sure you want to log out? modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Log Out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to log out? You will need to log in again to
          access your account and interact with the application.
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={logout}>
              Log Out
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NavbarComponent;
