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
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  element: ReactNode;
}

/**
 * ProtectedRoute component to protect routes based on user authentication and role, i.e users can't access admin pages,
 * and users can't access account pages if they're not logged in.
 * @param {ProtectedRouteProps} props - The properties of the component
 * @returns {ReactNode} - The protected route component
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({
  element,
}: ProtectedRouteProps): ReactNode => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // If user is logged in and tries to access the login page, redirect to home page
  if (location.pathname === "/login" && user) {
    navigate("/");
  }

  // If user is not logged in and tries to access the account page, redirect to login page
  if (location.pathname === "/account" && !user) {
    navigate("/login");
  }

  // If user is not logged in and tries to access the admin page, redirect to login page
  if (location.pathname === "/admin" && !user) {
    navigate("/login");
  }

  // If user is not logged in and tries to access the VM page, redirect to login page
  if (location.pathname === "/vm" && !user) {
    navigate("/login");
  }

  // If user is not an admin, redirect to home page
  if (location.pathname === "/admin" && user && user.role !== "admin") {
    navigate("/");
  }

  // If none of the above conditions are met, return the element
  return <>{element}</>;
};

export default ProtectedRoute;
