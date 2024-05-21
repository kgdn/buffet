import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegis from "./screens/LoginRegis";
import ManageUser from "./screens/ManageUser";
import Home from "./screens/Home";
import Admin from "./screens/Admin";
import VirtualMachineView from "./screens/VirtualMachineView";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const App: FC = () => {
  const prefersDarkMode = useMediaQuery({
    query: "(prefers-color-scheme: dark)",
  });

  if (prefersDarkMode) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", "light");
  }

  return (
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
  );
};

export default App;
