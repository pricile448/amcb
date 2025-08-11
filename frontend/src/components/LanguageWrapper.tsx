import React, { useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageWrapper: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n: i18nInstance } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 LanguageWrapper - Langue détectée:', lang);
    console.log('🔍 LanguageWrapper - Langue i18n actuelle:', i18nInstance.language);
    
    if (lang) {
      const validLanguages = ['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'];
      
      if (validLanguages.includes(lang)) {
        console.log('✅ LanguageWrapper - Langue valide, changement en cours...');
        // Changer la langue si elle est différente
        if (i18nInstance.language !== lang) {
          i18nInstance.changeLanguage(lang);
          localStorage.setItem('i18nextLng', lang);
          console.log('✅ LanguageWrapper - Langue changée vers:', lang);
        }
      } else {
        console.log('❌ LanguageWrapper - Langue invalide, redirection...');
        // Rediriger vers la langue par défaut
        const defaultLang = localStorage.getItem('i18nextLng') || 'fr';
        navigate(`/${defaultLang}`, { replace: true });
      }
    } else {
      console.log('❌ LanguageWrapper - Pas de langue détectée');
    }
  }, [lang, i18nInstance, navigate]);

  // Si pas de langue, ne pas afficher
  if (!lang) {
    console.log('❌ LanguageWrapper - Retour null car pas de langue');
    return null;
  }

  console.log('✅ LanguageWrapper - Rendu Outlet pour langue:', lang);
  // Utiliser Outlet pour afficher les routes imbriquées
  return <Outlet />;
};

export default LanguageWrapper;
