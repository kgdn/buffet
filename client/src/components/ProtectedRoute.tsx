/*
* ProtectedRoute.tsx - Route protection component for the application.
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
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    element: React.ReactNode;
}

/**
 * ProtectedRoute component
 * @param {ProtectedRouteProps} props - The properties of the component
 * @returns {React.ReactNode} - The protected route component
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }: ProtectedRouteProps) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (location.pathname === '/login' && user) { // If user is already logged in, redirect to home page
        return <Navigate to="/" />;
    }

    if (location.pathname === '/admin' && user && user.role !== 'admin') { // If user is not an admin, redirect to home page
        return <Navigate to="/" />;
    }

    return <>{element}</>;
};

export default ProtectedRoute;
