import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'dark' | 'light';
export type EffectiveTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'kw_portfolio_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to OS system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveTheme: EffectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Apply theme to document root
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    root.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      // Toggle to explicit opposite of current effective
      setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
