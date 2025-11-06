import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

export const themes = {
  cyberpunk: 'Cyberpunk',
  forest: 'Forest',
  ocean: 'Ocean',
  synthwave: 'Synthwave',
  glamour: 'Glamour',
};

export type ThemeName = keyof typeof themes;

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('cyberpunk');

  useEffect(() => {
    const storedTheme = localStorage.getItem('pomodoro-theme') as ThemeName;
    if (storedTheme && themes[storedTheme]) {
      setThemeState(storedTheme);
      document.body.setAttribute('data-theme', storedTheme);
    } else {
      document.body.setAttribute('data-theme', 'cyberpunk');
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('pomodoro-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};