import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

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

// Fonction pour obtenir la langue depuis localStorage
const getStoredLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'fr';
  }
  return 'fr';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'fr',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
    debug: process.env.NODE_ENV === 'development',
  })

export default i18n 