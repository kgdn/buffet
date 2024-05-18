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

import React, { useContext } from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/logo.svg';
import { AuthContext } from '../contexts/AuthContext';

const NavbarComponent: React.FC = () => {

    const { user, logout } = useContext(AuthContext);

    return (
        <Navbar bg="dark" variant="dark" expand="lg" style={{ padding: '10px', marginBottom: '20px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)' }} sticky='top'>
            <Container>
                <Navbar.Brand href="/">
                    <img
                        alt=""
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        style={{ marginRight: '10px' }}
                    />
                    Buffet
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="https://github.com/kgdn/buffet">
                            <i className="bi bi-github" style={{ color: 'white', marginRight: '5px' }}></i>
                            GitHub
                        </Nav.Link>
                        <Nav.Link href="https://kgdn.xyz">
                            <i className="bi bi-globe" style={{ color: 'white', marginRight: '5px' }}></i>
                            kgdn.xyz
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    {
                        user ?
                            <Nav>
                                <NavDropdown title={user.username} id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/account">Manage Account</NavDropdown.Item>
                                    {
                                        user.role === 'admin' ?
                                            <NavDropdown.Item href="/admin">Admin Panel</NavDropdown.Item>
                                            :
                                            null
                                    }
                                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            :
                            <Nav>
                                <Nav.Link href="/login">Login</Nav.Link>
                            </Nav>
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
