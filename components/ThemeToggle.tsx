'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`
        ${theme === 'cyberpunk'
                    ? 'hover:bg-cyan-950/50 text-cyan-400'
                    : 'hover:bg-purple-100 text-purple-600'
                }
      `}
            title={theme === 'light' ? 'Switch to Cyberpunk' : 'Switch to Light'}
        >
            {theme === 'light' ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
