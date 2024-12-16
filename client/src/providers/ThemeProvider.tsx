import { useState, useEffect, FC, ReactNode } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { useMediaQuery } from "react-responsive";

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeProvider: FC<ThemeProviderProps> = ({ children }: ThemeProviderProps) => {
    const isDarkMode = useMediaQuery({ query: "(prefers-color-scheme: dark)" });
    const [theme, setTheme] = useState(isDarkMode ? "dark" : "light");

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        document.body.setAttribute("data-bs-theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;