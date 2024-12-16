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

import { FC, ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  element: ReactNode; // The element to render
  requiredRole?: string; // The role required to access the route
  requireLogin?: boolean; // Whether the route requires the user to be logged in
  preventForLoggedIn?: boolean; // Whether the route should be prevented for logged in users
}

/**
 * ProtectedRoute component to protect routes based on user authentication and role, i.e users can't access admin pages,
 * and users can't access account pages if they're not logged in.
 * @param {ProtectedRouteProps} props - The properties of the component
 * @returns {ReactNode} - The protected route component
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({
  element,
  requiredRole,
  requireLogin,
  preventForLoggedIn,
}: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // If the user is not logged in and the route requires a login, redirect to the login page
  if (requireLogin && !user) {
    return <Navigate to="/login" />;
  }

  // If the user is logged in and the route is for users who are not logged in, redirect to the OS page
  if (preventForLoggedIn && user) {
    return <Navigate to="/os" />;
  }

  // If the user is logged in and the route requires a role, check if the user has the required role
  if (requireLogin && requiredRole && user) {
    if (user.role !== requiredRole) {
      return <Navigate to="/os" />;
    }
  }

  return <>{element}</>;
}

export default ProtectedRoute;