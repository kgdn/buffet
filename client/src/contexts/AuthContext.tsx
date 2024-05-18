/*
* AuthContext.tsx - Global authentication context for the application.
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

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AccountsAPI from '../api/AccountsAPI';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    two_factor_enabled: boolean;
}

interface AuthContextType {
    user: User | null;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({ user: null, logout: () => { } });

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

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
                window.location.href = '/';
                setUser(null);
            }
        });
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
