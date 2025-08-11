import React, { useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageWrapper: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n: i18nInstance } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang) {
      const validLanguages = ['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'];
      
      if (validLanguages.includes(lang)) {
        // Changer la langue si elle est différente
        if (i18nInstance.language !== lang) {
          i18nInstance.changeLanguage(lang);
          localStorage.setItem('i18nextLng', lang);
        }
      } else {
        // Rediriger vers la langue par défaut
        const defaultLang = localStorage.getItem('i18nextLng') || 'fr';
        navigate(`/${defaultLang}`, { replace: true });
      }
    }
  }, [lang, i18nInstance, navigate]);

  // Si pas de langue, ne pas afficher
  if (!lang) {
    return null;
  }

  // Utiliser Outlet pour afficher les routes imbriquées
  return <Outlet />;
};

export default LanguageWrapper;
