import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import AccountsAPI from '../api/AccountsAPI';

/**
 * Admittedly, this is a bit of a hacky solution to the problem of protecting
 * routes from unauthenticated users. This component will check if the user is
 * logged in and redirect them to the login page if they are not. It will also
 * check if the user is an admin and redirect them to the home page if they are
 * trying to access the admin panel. This component is used in App.js. 
 * 
 * If it works, don't fix it.
 */
function ProtectedRoute({ element }) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [role, setRole] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { status, data } = await AccountsAPI.getUserDetails();
                if (status === 200) {
                    setLoggedIn(true);
                    setRole(data.role);
                } else {
                    console.error(status);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <></>;
    }

    // If the user is not logged in, allow them to see the login page
    if (!loggedIn && window.location.pathname === '/login') {
        return element;
    }

    // If the user is not an admin and tries to access the admin panel, redirect them to the home page
    if (role !== 'admin' && window.location.pathname === '/admin') {
        return <Navigate to="/" />;
    }

    // If the user is logged in and tries to access the login page, redirect them to the home page
    if (loggedIn && window.location.pathname === '/login') {
        return <Navigate to="/" />;
    }

    // If all else fails, redirect to the home page
    return element;
}

ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
};

export default ProtectedRoute;
