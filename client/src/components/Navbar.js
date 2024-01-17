import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';

function NavbarComponent() {

    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setUsername(response.data.username);
                setRole(response.data.role);
            }
        }
        );
    }, []);

    return (
        <Navbar bg="primary" data-bs-theme="dark" style={{ marginBottom: '20px' }}>
            <Container>
                <Navbar.Brand href="/">Buffet</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link href="https://github.com/kgdn/buffet">GitHub</Nav.Link>
                </Nav>
                {/* Display two links in the navbar if the user is logged in, otherwise display a link to the login page */}
                {username ?
                    <Nav>
                        <Nav.Link href="/account">Signed in as {username}</Nav.Link>
                        {role === 'admin' ?
                            <Nav.Link href="/admin">Admin Panel</Nav.Link>
                            :
                            <></>
                        }
                    </Nav>
                    :
                    <Nav>
                        <Nav.Link href="/login">Login</Nav.Link>
                    </Nav>
                }
            </Container>
        </Navbar >
    );
}

export default NavbarComponent;
