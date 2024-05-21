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

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getUserDetails, logOut } from "../api/AccountsAPI";
import { useNavigate } from "react-router-dom";

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

const defaultLogout = () => {
  console.error("Logout function not set");
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => defaultLogout(),
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * @param {AuthProviderProps} props - The properties of the component
 * @returns {ReactNode} - The authentication provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps): ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Get the user details when the component mounts
  useEffect(() => {
    getUserDetails().then((response) => {
      if (response.status === 200) {
        setUser(response.data as User); // Set the user in the context
      }
    });
  }, []);

  // Logout function, clears the user from the context and redirects to the home page
  const logout = () => {
    logOut().then((response) => {
      if (response.status === 200) {
        navigate("/");
        navigate(0);
        setUser(null);
      }
    });
  };

  // Provide the user and logout function to the context
  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
