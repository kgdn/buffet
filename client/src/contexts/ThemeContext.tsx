/*
 * ThemeContext.tsx - Global dark/light theme context for the application.
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
import { createContext, FC, ReactNode, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export const ThemeContext = createContext("");

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const isDarkMode = useMediaQuery({ query: "(prefers-color-scheme: dark)" });
  const theme = isDarkMode ? "dark" : "light";

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
