import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginRegis from './screens/LoginRegis';
import ManageUser from './screens/ManageUser';
import Home from './screens/Home';
import Admin from './screens/Admin';
import VirtualMachineView from './screens/VirtualMachineView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegis />} />
        <Route path="/account" element={<ManageUser />} />
        <Route path="/vm" element={<VirtualMachineView />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
