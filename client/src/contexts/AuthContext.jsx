/*
* AuthContext.jsx - Global authentication context for the application.
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

import React, { createContext, useState, useEffect } from 'react';
import AccountsAPI from '../api/AccountsAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setUser(response.data);
            }
        });
    }, []);

    const logout = () => {
        AccountsAPI.logout().then((response) => {
            if (response.status === 200) {
                setUser(null);
                window.location.href = '/';
            }
        });
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};