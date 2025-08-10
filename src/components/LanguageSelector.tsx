import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'buttons';
  onLanguageChange?: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showLabel = false,
  variant = 'dropdown',
  onLanguageChange
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const languages: Language[] = [
    { code: "fr", name: t("languages.fr") as string, flag: "🇫🇷" },
    { code: "en", name: t("languages.en") as string, flag: "🇬🇧" },
    { code: "es", name: t("languages.es") as string, flag: "🇪🇸" },
    { code: "pt", name: t("languages.pt") as string, flag: "🇵🇹" },
    { code: "it", name: t("languages.it") as string, flag: "🇮🇹" },
    { code: "nl", name: t("languages.nl") as string, flag: "🇳🇱" },
    { code: "de", name: t("languages.de") as string, flag: "🇩🇪" },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    // Sauvegarder immédiatement dans localStorage
    localStorage.setItem('i18nextLng', lng);
    
    // Changer la langue
    i18n.changeLanguage(lng);
    
    // Naviguer vers la même page dans la nouvelle langue
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/');
    
    // Si le premier segment est une langue valide, la remplacer
    if (['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'].includes(pathSegments[1])) {
      pathSegments[1] = lng;
    } else {
      // Sinon, insérer la langue au début
      pathSegments.splice(1, 0, lng);
    }
    
    const newPath = pathSegments.join('/');
    navigate(newPath, { replace: true });
    
    setIsOpen(false);
    // Appeler la fonction de callback si elle existe
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  if (variant === 'buttons') {
    return (
      <div className={className}>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.language')}
          </label>
        )}
        <div className="grid grid-cols-4 gap-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                i18n.language === language.code
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500'
              }`}
              title={language.name}
            >
              <span className="text-2xl mb-1">{language.flag}</span>
              <span className="text-xs font-medium">{language.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:block">{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  i18n.language === language.code 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <span className="text-xl">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language.code.toUpperCase()}
                  </span>
                </div>
                {i18n.language === language.code && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;

