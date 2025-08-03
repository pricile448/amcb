import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('dark', 'light');
    
    if (themeToApply === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
      console.log('🌙 Dark theme applied globally');
    } else if (themeToApply === 'light') {
      root.classList.add('light');
      setIsDark(false);
      console.log('☀️ Light theme applied globally');
    } else if (themeToApply === 'auto') {
      // Auto theme - check system preference
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        root.classList.add('dark');
        setIsDark(true);
        console.log('🌙 Auto theme: Dark mode detected and applied globally');
      } else {
        root.classList.add('light');
        setIsDark(false);
        console.log('☀️ Auto theme: Light mode detected and applied globally');
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    console.log('🎨 Changing global theme to:', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const themeToApply = savedTheme || 'light';
    console.log('📱 Loading saved global theme:', themeToApply);
    setThemeState(themeToApply);
    applyTheme(themeToApply);
    
    // Listen for system theme changes if auto mode is active
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (themeToApply === 'auto') {
        console.log('🔄 System theme changed, updating global auto theme');
        applyTheme('auto');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const value = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 