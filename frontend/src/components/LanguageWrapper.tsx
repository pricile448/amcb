import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageWrapper: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n: i18nInstance } = useTranslation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

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
        // Éviter les redirections en boucle
        if (!isRedirecting) {
          setIsRedirecting(true);
          
          // Rediriger vers la langue par défaut
          const defaultLang = localStorage.getItem('i18nextLng') || 'fr';
          
          // Vérifier que la langue par défaut est valide
          if (!validLanguages.includes(defaultLang)) {
            localStorage.setItem('i18nextLng', 'fr');
            navigate('/fr', { replace: true });
          } else {
            navigate(`/${defaultLang}`, { replace: true });
          }
          
          // Réinitialiser le flag après un délai
          setTimeout(() => setIsRedirecting(false), 1000);
        }
      }
    }
  }, [lang, i18nInstance, navigate, isRedirecting]);

  // Si pas de langue, ne pas afficher
  if (!lang) {
    return null;
  }

  // Si on est en train de rediriger, afficher un loader
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Utiliser Outlet pour afficher les routes imbriquées
  return <Outlet />;
};

export default LanguageWrapper;
