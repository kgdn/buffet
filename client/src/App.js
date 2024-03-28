/*
* App.js - Main component for the application.
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

import React from 'react';
import { useMediaQuery } from 'react-responsive'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginRegis from './screens/LoginRegis';
import ManageUser from './screens/ManageUser';
import Home from './screens/Home';
import Admin from './screens/Admin';
import VirtualMachineView from './screens/VirtualMachineView';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const prefersDarkMode = useMediaQuery(
    {
      query: '(prefers-color-scheme: dark)'
    }
  );

  if (prefersDarkMode) {
    document.documentElement.setAttribute('data-bs-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light')
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<ProtectedRoute element={<LoginRegis />} />} />
          <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
          <Route path="/account" element={<ProtectedRoute element={<ManageUser />} />} />
          <Route path="/vm" element={<ProtectedRoute element={<VirtualMachineView />} />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
