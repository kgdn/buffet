import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function Admin() {

    useEffect(() => {
        document.title = 'Buffet - Admin';
    }, []);

    return (
        <div>
            <Navbar />
            <div className="container">
                <h1>Admin Panel</h1>
                <p>This is the admin panel.</p>
            </div>
        </div>
    );
}

export default Admin;