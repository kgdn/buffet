import React from 'react';
import NavbarComponent from '../components/Navbar'
import 'bootstrap/dist/css/bootstrap.min.css';
import AccountsAPI from '../api/AccountsAPI';
import { useNavigate } from 'react-router-dom';

// Log out the user and redirect to the login page

function Logout() {
    const navigate = useNavigate();

    AccountsAPI.logout();

    setTimeout(() => {
        navigate('/');
    }, 5000);

    return (
        <div>
            <NavbarComponent />
            <div className="container">
                <div className="row">
                    <div className="col" id="about">
                        <h1>Logout</h1>
                        <p>You have been logged out. You will be redirected to the login page shortly.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Logout;