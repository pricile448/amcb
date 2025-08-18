/**
 * Utilitaires de formatage pour l'application
 * @module formatters
 */

/**
 * Formate une date pour l'affichage dans l'interface
 * @param {Date} date - La date à formater
 * @param {('short'|'long'|'time'|'datetime')} format - Le format de date souhaité
 * @returns {string} La date formatée selon le format spécifié
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short', locale: string = 'fr-FR'): string {
  if (!date || isNaN(date.getTime())) {
    const lang = locale.split('-')[0];
    const translations: { [key: string]: string } = {
      'fr': 'Date invalide',
      'pt': 'Data inválida',
      'en': 'Invalid date',
      'es': 'Fecha inválida',
      'de': 'Ungültiges Datum',
      'it': 'Data non valida',
      'nl': 'Ongeldige datum'
    };
    return translations[lang] || translations['en'];
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  // Déterminer la langue pour les traductions
  const lang = locale.split('-')[0];
  
  // Fonction pour obtenir la traduction
  const getTranslation = (key: string): string => {
    const translations: { [key: string]: { [key: string]: string } } = {
      'fr': {
        'today': 'Aujourd\'hui',
        'yesterday': 'Hier',
        'invalidDate': 'Date invalide'
      },
      'pt': {
        'today': 'Hoje',
        'yesterday': 'Ontem',
        'invalidDate': 'Data inválida'
      },
      'en': {
        'today': 'Today',
        'yesterday': 'Yesterday',
        'invalidDate': 'Invalid date'
      },
      'es': {
        'today': 'Hoy',
        'yesterday': 'Ayer',
        'invalidDate': 'Fecha inválida'
      },
      'de': {
        'today': 'Heute',
        'yesterday': 'Gestern',
        'invalidDate': 'Ungültiges Datum'
      },
      'it': {
        'today': 'Oggi',
        'yesterday': 'Ieri',
        'invalidDate': 'Data non valida'
      },
      'nl': {
        'today': 'Vandaag',
        'yesterday': 'Gisteren',
        'invalidDate': 'Ongeldige datum'
      }
    };
    
    return translations[lang]?.[key] || translations['en'][key];
  };

  switch (format) {
    case 'time':
      return date.toLocaleTimeString(locale, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    
    case 'datetime':
      if (isToday) {
        const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        const separator = lang === 'fr' ? ' à ' : lang === 'pt' ? ' às ' : ' at ';
        return `${getTranslation('today')}${separator}${timeStr}`;
      } else if (isYesterday) {
        const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        const separator = lang === 'fr' ? ' à ' : lang === 'pt' ? ' às ' : ' at ';
        return `${getTranslation('yesterday')}${separator}${timeStr}`;
      } else {
        return date.toLocaleDateString(locale, { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    
    case 'long':
      return date.toLocaleDateString(locale, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    
    case 'short':
    default:
      if (isToday) {
        return getTranslation('today');
      } else if (isYesterday) {
        return getTranslation('yesterday');
      } else {
        return date.toLocaleDateString(locale, { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
  }
}

/**
 * Formate un montant avec la devise
 * @param {number} amount - Le montant à formater
 * @param {string} currency - Le code de la devise (par défaut 'EUR')
 * @param {string} locale - La locale à utiliser pour le formatage (par défaut 'fr-FR')
 * @returns {string} Le montant formaté avec la devise
 */
export function formatCurrency(amount: number, currency: string = 'EUR', locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Formate un montant sans devise (juste le nombre)
 * @param {number} number - Le nombre à formater
 * @param {string} locale - La locale à utiliser pour le formatage (par défaut 'fr-FR')
 * @returns {string} Le nombre formaté selon la locale
 */
export function formatNumber(number: number, locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Formate une référence de transaction pour l'affichage
 * @param {string} reference - La référence de transaction à formater
 * @returns {string} La référence formatée pour l'affichage
 */
export function formatReference(reference: string): string {
  if (!reference) return '-';
  
  // Nettoyer la référence en ne gardant que les caractères alphanumériques, tirets et underscores
  const cleanRef = reference.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Afficher seulement les 6 derniers caractères avec un préfixe approprié
  if (cleanRef.length > 8) {
    const lastChars = cleanRef.slice(-6);
    const prefix = cleanRef.startsWith('txn_') ? 'TXN' : 
                  cleanRef.startsWith('txn_out_') ? 'OUT' : 'REF';
    return `${prefix}-${lastChars}`;
  }
  
  return cleanRef;
}