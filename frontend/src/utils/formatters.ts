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
    return 'Date invalide';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  switch (format) {
    case 'time':
      return date.toLocaleTimeString(locale, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    
    case 'datetime':
      if (isToday) {
        return `Aujourd'hui à ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
      } else if (isYesterday) {
        return `Hier à ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
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
        return `Aujourd'hui`;
      } else if (isYesterday) {
        return `Hier`;
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