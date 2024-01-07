import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegis from './screens/LoginRegis';
import Logout from './screens/Logout';
import ManageUser from './screens/ManageUser';
import Home from './screens/Home';
import VirtualMachineView from './screens/VirtualMachineView';;

// Return routes as follows
// / [Home]
// /login [LoginRegis]
// /logout [Logout] (only accessible if logged in)
// /manageuser [ManageUser] (only accessible if logged in)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegis />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/manageuser" element={<ManageUser />} />
        <Route path="/vm/:user_id" element={<VirtualMachineView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;