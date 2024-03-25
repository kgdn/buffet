import React, { createContext, useState, useEffect } from 'react';
import AccountsAPI from './api/AccountsAPI';

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