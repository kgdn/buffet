import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginRegis from './screens/LoginRegis';
import ManageUser from './screens/ManageUser';
import Home from './screens/Home';
import Admin from './screens/Admin';
import VirtualMachineView from './screens/VirtualMachineView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegis />} />
        <Route path="/register" element={<LoginRegis />} />
        <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
        <Route path="/account" element={<ProtectedRoute element={<ManageUser />} />} />
        <Route path="/vm" element={<ProtectedRoute element={<VirtualMachineView />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;