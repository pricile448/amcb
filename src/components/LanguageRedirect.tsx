import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Détecter la langue préférée
    const savedLanguage = localStorage.getItem('i18nextLng');
    const browserLanguage = navigator.language.split('-')[0];
    
    // Langues supportées
    const supportedLanguages = ['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'];
    
    // Priorité : localStorage > navigateur > français par défaut
    let targetLanguage = 'fr';
    
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      targetLanguage = savedLanguage;
    } else if (browserLanguage && supportedLanguages.includes(browserLanguage)) {
      targetLanguage = browserLanguage;
    }
    
    // Rediriger vers la page d'accueil dans la langue appropriée
    navigate(`/${targetLanguage}`, { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default LanguageRedirect;
