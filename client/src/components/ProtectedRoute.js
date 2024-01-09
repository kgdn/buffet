import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import AccountsAPI from '../api/AccountsAPI';

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
        return null;
    }

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    if (element.props.path === '/admin' && role !== 'admin') {
        return <Navigate to="/" />;
    }

    return element;
}

ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
};

export default ProtectedRoute;
