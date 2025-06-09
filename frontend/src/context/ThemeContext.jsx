import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext('light');
 
export const ThemeProvider =({ children }) => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark'
    );

useEffect(() => {
  console.log('darkMode', darkMode);
  if (darkMode) {
    console.log('we add');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    console.log('we remove');
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }
}, [darkMode]);
    
    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

 export const usedarkMode = () => useContext(ThemeContext);