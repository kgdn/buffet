import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function ProtectedRoute({ element }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (location.pathname === '/login' && user) { // If user is already logged in, redirect to home page
        return <Navigate to="/" />;
    }

    if (location.pathname === '/admin' && user && user.role !== 'admin') { // If user is not an admin, redirect to home page
        return <Navigate to="/" />;
    }

    return element;
}

ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
};

export default ProtectedRoute;