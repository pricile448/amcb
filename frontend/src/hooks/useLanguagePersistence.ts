import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguagePersistence = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>('fr');

  // 🔧 Détection intelligente de la langue
  const detectLanguage = () => {
    // 1. Priorité: Langue sauvegardée dans localStorage (même clé qu'i18n)
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(savedLang)) {
      return savedLang;
    }
    
    // 2. Priorité: Langue actuelle de i18n
    if (i18n.language) return i18n.language;
    
    // 3. Priorité: Langue du navigateur
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(browserLang)) {
      return browserLang;
    }
    
    // 4. Défaut: Français
    return 'fr';
  };

  // 🔧 Changer la langue et la sauvegarder
  const changeLanguage = (language: string) => {
    if (['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(language)) {
      i18n.changeLanguage(language);
      localStorage.setItem('i18nextLng', language);
      setCurrentLanguage(language);
    }
  };

  // 🔧 Initialisation et synchronisation
  useEffect(() => {
    const detectedLang = detectLanguage();
    
    if (detectedLang !== i18n.language) {
      i18n.changeLanguage(detectedLang);
    }
    
    setCurrentLanguage(detectedLang);
    
    // Sauvegarder la langue détectée si elle n'est pas déjà sauvegardée
    if (!localStorage.getItem('i18nextLng')) {
      localStorage.setItem('i18nextLng', detectedLang);
    }
  }, []);

  // 🔧 Écouter les changements de langue d'i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return {
    currentLanguage,
    changeLanguage,
    detectLanguage
  };
};
