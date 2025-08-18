/**
 * Utilitaires avancés de formatage de dates pour l'application
 * @module dateFormatters
 */

/**
 * Options pour le formatage des dates
 */
export interface DateFormatOptions {
  /** Locale à utiliser pour le formatage (par défaut: 'fr-FR') */
  locale?: string;
  /** Format prédéfini à utiliser */
  preset?: 'short' | 'long' | 'time' | 'datetime' | 'relative';
  /** Options personnalisées de formatage (Intl.DateTimeFormatOptions) */
  customOptions?: Intl.DateTimeFormatOptions;
  /** Texte à afficher pour aujourd'hui (par défaut: "Aujourd'hui") */
  todayText?: string;
  /** Texte à afficher pour hier (par défaut: "Hier") */
  yesterdayText?: string;
  /** Utiliser des textes relatifs pour aujourd'hui et hier */
  useRelativeTexts?: boolean;
}

/**
 * Formate une date selon les options spécifiées
 * @param {Date} date - La date à formater
 * @param {DateFormatOptions} options - Options de formatage
 * @returns {string} La date formatée
 */
export function formatDate(date: Date, options: DateFormatOptions = {}): string {
  const {
    locale = 'fr-FR',
    preset = 'short',
    customOptions,
    todayText = "Aujourd'hui",
    yesterdayText = "Hier",
    useRelativeTexts = true
  } = options;

  if (!date || isNaN(date.getTime())) {
    return 'Date invalide';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  // Si des options personnalisées sont fournies, les utiliser directement
  if (customOptions) {
    return new Intl.DateTimeFormat(locale, customOptions).format(date);
  }

  // Sinon, utiliser le preset
  switch (preset) {
    case 'time':
      return new Intl.DateTimeFormat(locale, { 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date);
    
    case 'datetime':
      if (useRelativeTexts && isToday) {
        return `${todayText} à ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)}`;
      } else if (useRelativeTexts && isYesterday) {
        return `${yesterdayText} à ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)}`;
      } else {
        return new Intl.DateTimeFormat(locale, { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
    
    case 'long':
      return new Intl.DateTimeFormat(locale, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    
    case 'relative':
      return formatRelativeDate(date, { locale, todayText, yesterdayText });
    
    case 'short':
    default:
      if (useRelativeTexts && isToday) {
        return todayText;
      } else if (useRelativeTexts && isYesterday) {
        return yesterdayText;
      } else {
        return new Intl.DateTimeFormat(locale, { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).format(date);
      }
  }
}

/**
 * Options pour le formatage des dates relatives
 */
export interface RelativeDateOptions {
  /** Locale à utiliser pour le formatage (par défaut: 'fr-FR') */
  locale?: string;
  /** Texte à afficher pour aujourd'hui (par défaut: "Aujourd'hui") */
  todayText?: string;
  /** Texte à afficher pour hier (par défaut: "Hier") */
  yesterdayText?: string;
  /** Nombre maximum de jours pour afficher "Il y a X jours" (par défaut: 7) */
  maxDaysAgo?: number;
}

/**
 * Formate une date en texte relatif (aujourd'hui, hier, il y a X jours, etc.)
 * @param {Date} date - La date à formater
 * @param {RelativeDateOptions} options - Options de formatage
 * @returns {string} La date formatée en texte relatif
 */
export function formatRelativeDate(date: Date, options: RelativeDateOptions = {}): string {
  const {
    locale = 'fr-FR',
    todayText = "Aujourd'hui",
    yesterdayText = "Hier",
    maxDaysAgo = 7
  } = options;

  if (!date || isNaN(date.getTime())) {
    return 'Date invalide';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = today.getTime() - dateDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return todayText;
  } else if (diffDays === 1) {
    return yesterdayText;
  } else if (diffDays > 1 && diffDays <= maxDaysAgo) {
    return `Il y a ${diffDays} jours`;
  } else {
    return new Intl.DateTimeFormat(locale, { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  }
}

/**
 * Formate une durée en texte (1h 30m, 2j 5h, etc.)
 * @param {number} durationMs - La durée en millisecondes
 * @param {boolean} compact - Utiliser un format compact (par défaut: false)
 * @returns {string} La durée formatée en texte
 */
export function formatDuration(durationMs: number, compact: boolean = false): string {
  if (durationMs < 0) {
    return 'Durée invalide';
  }

  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  if (compact) {
    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ') || '0s';
  } else {
    const parts = [];
    if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds > 0 && parts.length === 0) parts.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`);
    return parts.join(' et ') || '0 seconde';
  }
}

/**
 * Analyse une chaîne de caractères pour en extraire une date
 * @param {string} value - La chaîne à analyser
 * @param {string} locale - La locale à utiliser (par défaut: 'fr-FR')
 * @returns {Date|null} La date extraite ou null si la chaîne n'est pas une date valide
 */
export function parseDate(value: string, locale: string = 'fr-FR'): Date | null {
  try {
    // Essayer de parser avec Date.parse standard
    const timestamp = Date.parse(value);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }

    // Pour les formats localisés comme DD/MM/YYYY (fr-FR)
    if (locale === 'fr-FR') {
      const match = value.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
      if (match) {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }

    // Pour les formats comme MM/DD/YYYY (en-US)
    if (locale === 'en-US') {
      const match = value.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
      if (match) {
        const [, month, day, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}