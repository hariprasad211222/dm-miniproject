import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('dmaut_theme') || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('dark');

  useEffect(() => {
    function applyTheme() {
      let resolved = theme;
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'dark' : 'light';
      }

      setEffectiveTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('dmaut_theme', theme);
    }

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
