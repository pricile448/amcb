import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { logger } from '../utils/logger';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showText = false 
}) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    logger.debug('🎨 Changing theme to:', newTheme);
    setTheme(newTheme);
  };

  const getNextTheme = (): 'light' | 'dark' | 'auto' => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'auto';
      case 'auto':
        return 'light';
      default:
        return 'light';
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'auto':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Light';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleThemeChange(getNextTheme())}
        className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={`Current theme: ${getThemeText()}. Click to cycle themes.`}
      >
        {getThemeIcon()}
        {showText && <span className="text-sm font-medium">{getThemeText()}</span>}
      </button>
    </div>
  );
};

export default ThemeToggle; 