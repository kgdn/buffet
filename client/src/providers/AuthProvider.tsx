import { useState, useEffect, FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, User } from "../contexts/AuthContext";
import { getUserDetails, logOut } from "../api/AccountsAPI";

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = sessionStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const navigate = useNavigate();

    // Get the user details when the component mounts, except when on the home page
    useEffect(() => {
        if (!user && window.location.pathname !== "/") {
            getUserDetails().then((response) => {
                if (response.status === 200) {
                    setUser(response.data as User); // Set the user in the context
                    sessionStorage.setItem("user", JSON.stringify(response.data)); // Store user in sessionStorage
                }
            });
        }
    }, [user]);

    // Logout function, clears the user from the context and redirects to the home page
    const logout = () => {
        logOut().then((response: { status: number; }) => {
            if (response.status === 200) {
                navigate("/"); // Redirect to the home page
                navigate(0);
                setUser(null);
                sessionStorage.removeItem("user"); // Remove user from sessionStorage
            }
        });
    };

    // Provide the user and logout function to the context
    return (
        <AuthContext.Provider value={{ user, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;