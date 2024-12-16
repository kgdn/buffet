import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AuthProvider from "./providers/AuthProvider.tsx";
import ThemeProvider from "./providers/ThemeProvider.tsx";
import AdminPanelScreen from "./screens/AdminPanelScreen.tsx";
import OperatingSystemListScreen from "./screens/OperatingSystemListScreen.tsx";
import LoginRegistrationScreen from "./screens/LoginRegistrationScreen.tsx";
import UserManagementScreen from "./screens/UserManagementScreen.tsx";
import VirtualMachineViewScreen from "./screens/VirtualMachineViewScreen.tsx";
import HomeScreen from "./screens/HomeScreen";
import NotFoundScreen from "./screens/NotFoundScreen.tsx";

const App: FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="*" element={<NotFoundScreen />} />
            <Route
              path="/"
              element={<ProtectedRoute element={<HomeScreen />} />} />
            <Route
              path="/login"
              element={<ProtectedRoute preventForLoggedIn element={<LoginRegistrationScreen />} />}
            />
            <Route
              path="/os"
              element={<ProtectedRoute requireLogin element={<OperatingSystemListScreen />} />}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute requireLogin requiredRole="admin" element={<AdminPanelScreen />} />}
            />
            <Route
              path="/account"
              element={<ProtectedRoute requireLogin element={<UserManagementScreen />} />}
            />
            <Route
              path="/vm"
              element={<ProtectedRoute requireLogin element={<VirtualMachineViewScreen />} />}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
