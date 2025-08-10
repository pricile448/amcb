import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { detectLanguageFromDomain, DEFAULT_LANGUAGE, redirectToCorrectDomain } from './utils/domainLanguageDetector'

// Import des traductions
import fr from './locales/fr.json'
import en from './locales/en.json'
import es from './locales/es.json'
import pt from './locales/pt.json'
import it from './locales/it.json'
import nl from './locales/nl.json'
import de from './locales/de.json'

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
  nl: { translation: nl },
  de: { translation: de },
}

// Fonction simplifiée pour obtenir la langue initiale
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    // 1. Priorité absolue aux préférences utilisateur stockées
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage && ['fr', 'en', 'es', 'pt', 'it', 'nl', 'de'].includes(storedLanguage)) {
      return storedLanguage;
    }
    
    // 2. Si pas de préférence stockée, détecter depuis le domaine
    const domainLanguage = detectLanguageFromDomain();
    
    // 3. Stocker la langue détectée pour la prochaine fois
    localStorage.setItem('i18nextLng', domainLanguage);
    
    return domainLanguage;
  }
  return DEFAULT_LANGUAGE;
};

// Détecteur personnalisé pour les domaines
const domainDetector = {
  name: 'domainDetector',
  lookup() {
    return detectLanguageFromDomain();
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    detection: {
      // ✅ CORRIGÉ: Priorité aux préférences utilisateur
      order: ['localStorage', 'domainDetector', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  })

// Ajouter le détecteur personnalisé
i18n.services.languageDetector.addDetector(domainDetector);

// Fonction pour changer de langue avec redirection de domaine
export const changeLanguageWithDomainRedirect = (language: string) => {
  if (typeof window !== 'undefined') {
    // Sauvegarder la préférence AVANT tout
    localStorage.setItem('i18nextLng', language);
    
    // Changer la langue dans i18n
    i18n.changeLanguage(language);
    
    // Rediriger vers le bon domaine en production seulement si nécessaire
    if (process.env.NODE_ENV === 'production') {
      // Vérifier si on est déjà sur le bon domaine
      const currentDomain = window.location.hostname;
      const targetDomain = language === 'fr' ? 'mybunq.amccredit.com' : `${language}.mybunq.amccredit.com`;
      
      if (currentDomain !== targetDomain) {
        redirectToCorrectDomain(language as any);
      }
    }
  }
};

export default i18n 