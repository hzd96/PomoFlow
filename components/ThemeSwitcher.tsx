import React from 'react';
import { useTheme, themes, ThemeName } from '../contexts/ThemeContext';

const themeIcons: Record<ThemeName, string> = {
  cyberpunk: 'fas fa-robot',
  forest: 'fas fa-tree',
  ocean: 'fas fa-water',
  synthwave: 'fas fa-headphones',
  glamour: 'fas fa-gem',
};

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="absolute top-4 right-4 bg-surface/50 backdrop-blur-xl p-2 rounded-full flex items-center gap-1 border border-white/10 z-10 shadow-lg">
      {Object.keys(themes).map((themeKey) => {
        const key = themeKey as ThemeName;
        const isActive = theme === key;
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            title={themes[key]}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 relative ${
              isActive
                ? 'bg-primary text-text-inverted scale-110 shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-surface/50'
                : 'text-text-muted hover:bg-surface-light hover:text-text-base'
            }`}
          >
            <i className={themeIcons[key]}></i>
          </button>
        );
      })}
    </div>
  );
};