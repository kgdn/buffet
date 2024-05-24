import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./screens/Admin";
import Home from "./screens/Home";
import LoginRegis from "./screens/LoginRegis";
import ManageUser from "./screens/ManageUser";
import VirtualMachineView from "./screens/VirtualMachineView";

const App: FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={<ProtectedRoute element={<LoginRegis />} />}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute element={<Admin />} />}
            />
            <Route
              path="/account"
              element={<ProtectedRoute element={<ManageUser />} />}
            />
            <Route
              path="/vm"
              element={<ProtectedRoute element={<VirtualMachineView />} />}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
