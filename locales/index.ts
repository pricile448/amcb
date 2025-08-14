// Import des fichiers de localisation
import fr from './fr.json';
import en from './en.json';
import es from './es.json';
import de from './de.json';
import it from './it.json';
import nl from './nl.json';
import pt from './pt.json';

// Types pour les traductions
export type LanguageCode = 'fr' | 'en' | 'es' | 'de' | 'it' | 'nl' | 'pt';

export interface TransactionTranslations {
  transactions: {
    fields: {
      date: string;
      description: string;
      account: string;
      category: string;
      reference: string;
      amount: string;
    };
    labels: {
      language: string;
      selectLanguage: string;
    };
    actions: {
      add: string;
      edit: string;
      delete: string;
      save: string;
      cancel: string;
    };
    messages: {
      noTransactions: string;
      transactionAdded: string;
      transactionUpdated: string;
      transactionDeleted: string;
    };
  };
}

// Objet contenant toutes les traductions
export const translations: Record<LanguageCode, TransactionTranslations> = {
  fr,
  en,
  es,
  de,
  it,
  nl,
  pt
};

// Fonction pour obtenir les traductions d'une langue
export function getTranslations(language: LanguageCode): TransactionTranslations {
  return translations[language] || translations.en; // Fallback vers l'anglais
}

// Fonction pour obtenir la traduction d'un champ spécifique
export function getFieldTranslation(
  language: LanguageCode, 
  field: keyof TransactionTranslations['transactions']['fields']
): string {
  const langTranslations = getTranslations(language);
  return langTranslations.transactions.fields[field];
}

// Fonction pour obtenir le label de langue traduit
export function getLanguageLabel(language: LanguageCode): string {
  const langTranslations = getTranslations(language);
  return langTranslations.transactions.labels.language;
}

// Fonction pour obtenir toutes les traductions d'un champ
export function getAllFieldTranslations(
  field: keyof TransactionTranslations['transactions']['fields']
): Record<LanguageCode, string> {
  const result: Record<LanguageCode, string> = {} as Record<LanguageCode, string>;
  
  Object.keys(translations).forEach((lang) => {
    const languageCode = lang as LanguageCode;
    result[languageCode] = translations[languageCode].transactions.fields[field];
  });
  
  return result;
}

// Export des traductions individuelles
export { fr, en, es, de, it, nl, pt };
