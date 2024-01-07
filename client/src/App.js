import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegis from './screens/LoginRegis';
import Logout from './screens/Logout';
import ManageUser from './screens/ManageUser';
import Home from './screens/Home';
import VirtualMachineView from './screens/VirtualMachineView';

// Return routes as follows
// / [Home]
// /login [LoginRegis]
// /logout [Logout] (only accessible if logged in)
// /manageuser [ManageUser] (only accessible if logged in)

// If the user is logged in, they can seee the following routes
// /vm/:user_id [VirtualMachineView]
// /manageuser [ManageUser]

// If the user is not logged in, they can see the following routes
// / [Home]
// /login [LoginRegis]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegis />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/manageuser" element={<ManageUser />} />
        <Route path="/vm/" element={<VirtualMachineView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;