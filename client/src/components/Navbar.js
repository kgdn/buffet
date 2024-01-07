import React, { useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import AccountsAPI from '../api/AccountsAPI';

function NavbarComponent() {

    const [username, setUsername] = React.useState('');

    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setUsername(response.data.username);
            }
        }
        );
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
                        {username ?
                            <>
                                <Navbar.Text>Welcome, <a href="/manageuser">{username}</a></Navbar.Text>
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
