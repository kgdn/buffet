import React, { useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';

function checkLogin() {
    // If token exists, return true
    if (localStorage.getItem('token')) {
        return true;
    } else {
        return false;
    }
}

function NavbarComponent() {

    const [username, setUsername] = React.useState('');

    useEffect(() => {
        AccountsAPI.getUserName().then((response) => {
            if (response) {
                setUsername(response);
            }
        });
    }, []);

    return (
        <Navbar bg="light" data-bs-theme="light" className='bg-body-tertiary'>
            <Container>
                <Navbar.Brand href="/">Buffet</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link href="https://github.com/kgdn/buffet">GitHub</Nav.Link>
                </Nav>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        {/* If logged in, display manage user button and logout button */}
                        {checkLogin() ?
                            <>
                                <Navbar.Text>Signed in as: <a href="/manageuser">{username}</a></Navbar.Text>
                            </>
                            :
                            <Nav.Link href="/login">Log in</Nav.Link>
                        }
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
}

export default NavbarComponent;
