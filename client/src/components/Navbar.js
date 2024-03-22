import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '!file-loader!../assets/logo.svg';

function NavbarComponent() {

    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setUsername(response.data.username);
                setRole(response.data.role);
            }
        });
    }, []);


    const logout = () => {
        AccountsAPI.logout().then((response) => {
            if (response.status === 200) {
                window.location.href = '/';
            }
        });
    }

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
                        style={{ marginRight: '5px' }}
                    />
                    Buffet
                </Navbar.Brand>
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
                {
                    username ?
                        <Nav>
                            <NavDropdown title={username} id="basic-nav-dropdown">
                                <NavDropdown.Item href="/account">Manage Account</NavDropdown.Item>
                                {
                                    role === 'admin' ?
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
            </Container >
        </Navbar >
    );
}

export default NavbarComponent;
