import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = '', 
  showLabel = true, 
  label = "Thème" 
}) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    logger.debug('🎨 Changing theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleThemeChange('light')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
            theme === 'light'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500'
          }`}
        >
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <span className="text-sm font-medium">Light</span>
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
            theme === 'dark'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500'
          }`}
        >
          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
          <span className="text-sm font-medium">Dark</span>
        </button>
        
        <button
          onClick={() => handleThemeChange('auto')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
            theme === 'auto'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500'
          }`}
        >
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-gray-800 rounded-full"></div>
          <span className="text-sm font-medium">Auto</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector; 