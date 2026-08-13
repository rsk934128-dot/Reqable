import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  resetToSystemTheme: () => void;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  resetToSystemTheme: () => {},
  isSystemTheme: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasExplicitUserPreference, setHasExplicitUserPreference] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reqable_theme') !== null;
    } catch {
      return false;
    }
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('reqable_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error(e);
    }
    // Auto-detection using system 'prefers-color-scheme' media query on initial load
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Listen for real-time changes in system 'prefers-color-scheme' preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Auto-switch to system theme if user has not explicitly locked a manual override
      if (!hasExplicitUserPreference) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as any).removeListener(handleSystemThemeChange);
      }
    };
  }, [hasExplicitUserPreference]);

  // Apply HTML document root classes and handle localStorage sync
  useEffect(() => {
    if (hasExplicitUserPreference) {
      try {
        localStorage.setItem('reqable_theme', theme);
      } catch (e) {
        console.error(e);
      }
    }

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme, hasExplicitUserPreference]);

  const toggleTheme = () => {
    setHasExplicitUserPreference(true);
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setHasExplicitUserPreference(true);
    setThemeState(newTheme);
  };

  const resetToSystemTheme = () => {
    try {
      localStorage.removeItem('reqable_theme');
    } catch (e) {
      console.error(e);
    }
    setHasExplicitUserPreference(false);
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(isDark ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        resetToSystemTheme,
        isSystemTheme: !hasExplicitUserPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

