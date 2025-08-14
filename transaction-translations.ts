// Types pour les traductions des champs de transactions
export type LanguageCode = 
  | 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'nl' | 'pl' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi' | 'tr';

export type TransactionField = 'date' | 'description' | 'account' | 'category' | 'reference' | 'amount';

export interface TransactionTranslations {
  transactionFields: {
    [key in TransactionField]: {
      [lang in LanguageCode]: string;
    };
  };
  languages: {
    [lang in LanguageCode]: string;
  };
  languageLabels: {
    [lang in LanguageCode]: string;
  };
}

// Traductions des champs de transactions
export const transactionTranslations: TransactionTranslations = {
  transactionFields: {
    date: {
      fr: "Date",
      en: "Date",
      es: "Fecha",
      de: "Datum",
      it: "Data",
      pt: "Data",
      nl: "Datum",
      pl: "Data",
      ru: "Дата",
      ja: "日付",
      ko: "날짜",
      zh: "日期",
      ar: "التاريخ",
      hi: "तारीख",
      tr: "Tarih"
    },
    description: {
      fr: "Description",
      en: "Description",
      es: "Descripción",
      de: "Beschreibung",
      it: "Descrizione",
      pt: "Descrição",
      nl: "Beschrijving",
      pl: "Opis",
      ru: "Описание",
      ja: "説明",
      ko: "설명",
      zh: "描述",
      ar: "الوصف",
      hi: "विवरण",
      tr: "Açıklama"
    },
    account: {
      fr: "Compte",
      en: "Account",
      es: "Cuenta",
      de: "Konto",
      it: "Conto",
      pt: "Conta",
      nl: "Rekening",
      pl: "Konto",
      ru: "Счет",
      ja: "口座",
      ko: "계좌",
      zh: "账户",
      ar: "الحساب",
      hi: "खाता",
      tr: "Hesap"
    },
    category: {
      fr: "Catégorie",
      en: "Category",
      es: "Categoría",
      de: "Kategorie",
      it: "Categoria",
      pt: "Categoria",
      nl: "Categorie",
      pl: "Kategoria",
      ru: "Категория",
      ja: "カテゴリ",
      ko: "카테고리",
      zh: "类别",
      ar: "الفئة",
      hi: "श्रेणी",
      tr: "Kategori"
    },
    reference: {
      fr: "Référence",
      en: "Reference",
      es: "Referencia",
      de: "Referenz",
      it: "Riferimento",
      pt: "Referência",
      nl: "Referentie",
      pl: "Referencja",
      ru: "Ссылка",
      ja: "参照",
      ko: "참조",
      zh: "参考",
      ar: "المرجع",
      hi: "संदर्भ",
      tr: "Referans"
    },
    amount: {
      fr: "Montant",
      en: "Amount",
      es: "Importe",
      de: "Betrag",
      it: "Importo",
      pt: "Valor",
      nl: "Bedrag",
      pl: "Kwota",
      ru: "Сумма",
      ja: "金額",
      ko: "금액",
      zh: "金额",
      ar: "المبلغ",
      hi: "राशि",
      tr: "Tutar"
    }
  },
  languages: {
    fr: "Français",
    en: "English",
    es: "Español",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    nl: "Nederlands",
    pl: "Polski",
    ru: "Русский",
    ja: "日本語",
    ko: "한국어",
    zh: "中文",
    ar: "العربية",
    hi: "हिन्दी",
    tr: "Türkçe"
  },
  languageLabels: {
    fr: "Langue",
    en: "Language",
    es: "Idioma",
    de: "Sprache",
    it: "Lingua",
    pt: "Idioma",
    nl: "Taal",
    pl: "Język",
    ru: "Язык",
    ja: "言語",
    ko: "언어",
    zh: "语言",
    ar: "اللغة",
    hi: "भाषा",
    tr: "Dil"
  }
};

// Fonction utilitaire pour obtenir la traduction d'un champ
export function getTransactionFieldTranslation(
  field: TransactionField, 
  language: LanguageCode
): string {
  return transactionTranslations.transactionFields[field][language] || field;
}

// Fonction pour obtenir toutes les traductions d'un champ
export function getAllTranslationsForField(field: TransactionField): Record<LanguageCode, string> {
  return transactionTranslations.transactionFields[field];
}

// Fonction pour obtenir le nom de la langue
export function getLanguageName(language: LanguageCode): string {
  return transactionTranslations.languages[language] || language;
}

// Fonction pour obtenir le label "Langue" traduit
export function getLanguageLabel(language: LanguageCode): string {
  return transactionTranslations.languageLabels[language] || "Language";
}

// Interface pour les données de transaction
export interface Transaction {
  id?: string;
  date: Date;
  description: string;
  account: string;
  category: string;
  reference: string;
  amount: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour l'affichage des transactions avec traductions
export interface TransactionDisplay {
  transaction: Transaction;
  translations: Record<TransactionField, string>;
  language: LanguageCode;
}

// Fonction pour créer un objet d'affichage avec traductions
export function createTransactionDisplay(
  transaction: Transaction, 
  language: LanguageCode
): TransactionDisplay {
  const translations: Record<TransactionField, string> = {
    date: getTransactionFieldTranslation('date', language),
    description: getTransactionFieldTranslation('description', language),
    account: getTransactionFieldTranslation('account', language),
    category: getTransactionFieldTranslation('category', language),
    reference: getTransactionFieldTranslation('reference', language),
    amount: getTransactionFieldTranslation('amount', language)
  };

  return {
    transaction,
    translations,
    language
  };
}
