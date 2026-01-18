'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'cyberpunk';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('crytonix-theme') as Theme | null;
        if (savedTheme) {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        if (newTheme === 'cyberpunk') {
            root.setAttribute('data-theme', 'cyberpunk');
            root.classList.add('dark');
        } else {
            root.removeAttribute('data-theme');
            root.classList.remove('dark');
        }
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('crytonix-theme', newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'cyberpunk' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
