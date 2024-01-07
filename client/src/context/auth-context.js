// auth-context.js
import React, { createContext, useState } from 'react';
import AccountsAPI from '../api/AccountsAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);

    const checkLogin = async () => {
        const response = await AccountsAPI.getUserDetails();
        if (response.status === 200) {
            setLoggedIn(true);
        }
    }

    const logout = async () => {
        const response = await AccountsAPI.logout();
        if (response.status === 200) {
            setLoggedIn(false);
        }
    }

    return (
        <AuthContext.Provider value={{ loggedIn, checkLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;